"""
Voice embedding + speaker matching for the voice roll-call feature.
Uses librosa and soundfile directly without requiring pydub or pyaudioop.
"""

import io
import av
import librosa
import numpy as np
from resemblyzer import VoiceEncoder, preprocess_wav
from app.core.config import settings

_encoder = None

def load_voice_encoder() -> VoiceEncoder:
    global _encoder
    if _encoder is None:
        _encoder = VoiceEncoder()
    return _encoder

def get_voice_embedding(audio_bytes: bytes) -> list[float] | None:
    """Returns one student's voiceprint from browser WebM/Opus bytes using PyAV."""
    encoder = load_voice_encoder()
    
    try:
        # Decode WebM/Opus bytes in-memory using PyAV container
        container = av.open(io.BytesIO(audio_bytes))
        stream = next(s for s in container.streams if s.type == 'audio')
        
        frames = []
        for frame in container.decode(stream):
            # Convert audio frame to numpy array
            frames.append(frame.to_ndarray())
            
        if not frames:
            raise ValueError("No audio frames decoded from stream.")
            
        audio = np.concatenate(frames, axis=1)
        # Convert to mono if stereo
        if audio.ndim > 1:
            audio = np.mean(audio, axis=0)
            
        audio = audio.astype(np.float32)
        
        # Resample to 16kHz if necessary using librosa
        if stream.rate != 16000:
            audio = librosa.resample(audio, orig_sr=stream.rate, target_sr=16000)
            
    except Exception as e:
        print(f"PyAV decoding failed: {e}")
        return None

    if len(audio) == 0:
        raise ValueError("Audio stream is empty.")

    wav = preprocess_wav(audio)
    embedding = encoder.embed_utterance(wav)
    return embedding.tolist()

def identify_speaker(
    new_embedding: np.ndarray,
    candidates: dict[int, list[float]],
    threshold: float = None,
) -> tuple[int | None, float]:
    """candidates: {student_id: voice_embedding}"""
    threshold = threshold if threshold is not None else settings.VOICE_MATCH_THRESHOLD

    best_sid = None
    best_score = -1.0

    for sid, stored_embedding in candidates.items():
        similarity = float(np.dot(new_embedding, stored_embedding))
        if similarity > best_score:
            best_score = similarity
            best_sid = sid

    if best_score >= threshold:
        return best_sid, best_score
    return None, best_score


def process_bulk_audio(
    audio_bytes: bytes,
    candidates: dict[int, list[float]],
    threshold: float = None,
) -> dict[int, float]:
    """
    Splits one long roll-call recording into segments wherever it goes
    quiet, and matches each segment against the candidate students using PyAV.
    Returns {student_id: best_match_score}.
    """
    encoder = load_voice_encoder()
    
    try:
        # Decode teacher bulk audio bytes via PyAV container
        container = av.open(io.BytesIO(audio_bytes))
        stream = next(s for s in container.streams if s.type == 'audio')
        
        frames = []
        for frame in container.decode(stream):
            frames.append(frame.to_ndarray())
            
        if not frames:
            print("Failed to decode bulk audio: No frames found.")
            return {}
            
        audio = np.concatenate(frames, axis=1)
        if audio.ndim > 1:
            audio = np.mean(audio, axis=0)
            
        audio = audio.astype(np.float32)
        
        if stream.rate != 16000:
            audio = librosa.resample(audio, orig_sr=stream.rate, target_sr=16000)
            
    except Exception as e:
        print(f"Failed to decode bulk roll-call audio via PyAV: {e}")
        return {}

    sr = 16000
    segments = librosa.effects.split(audio, top_db=30)
    identified: dict[int, float] = {}

    for start, end in segments:
        if (end - start) < sr * 0.5:
            continue  # too short to be a real utterance

        try:
            segment_audio = audio[start:end]
            wav = preprocess_wav(segment_audio)
            embedding = encoder.embed_utterance(wav)

            sid, score = identify_speaker(embedding, candidates, threshold)
            if sid is not None:
                if sid not in identified or score > identified[sid]:
                    identified[sid] = score
        except Exception:
            continue  # skip this one bad segment, keep processing the rest

    return identified