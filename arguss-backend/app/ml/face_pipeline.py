"""
Face detection + embedding + matching.

Two matching use cases, both handled by the same identify_face() helper:
1. Login (student_screen equivalent): match one face against ALL students.
2. Attendance (teacher marking a class): match every face in a group photo
   against only the students enrolled in that one subject.

The old Streamlit version used an SVM classifier plus a distance check as
a safety net. With real API endpoints now, we can skip the SVM entirely —
it was trained on a single embedding per student anyway (one sample per
class), so it added complexity without adding real accuracy over the
distance check alone. Plain nearest-neighbor matching is simpler, avoids
the "SVM needs at least 2 students" edge case, and behaves identically.
"""

import dlib
import numpy as np
import face_recognition_models

from app.core.config import settings

_detector = None
_shape_predictor = None
_facerec = None


def load_dlib_models():
    """Lazy singleton — loaded once on first use (or eagerly at app
    startup, see main.py), never reloaded per-request."""
    global _detector, _shape_predictor, _facerec
    if _detector is None:
        _detector = dlib.get_frontal_face_detector()
        _shape_predictor = dlib.shape_predictor(
            face_recognition_models.pose_predictor_model_location()
        )
        _facerec = dlib.face_recognition_model_v1(
            face_recognition_models.face_recognition_model_location()
        )
    return _detector, _shape_predictor, _facerec


def get_face_embeddings(image_np: np.ndarray) -> list[np.ndarray]:
    """Returns a list of 128-d embeddings, one per detected face.
    Returns [] (never None) if no faces are found."""
    detector, shape_predictor, facerec = load_dlib_models()
    faces = detector(image_np, 1)

    embeddings = []
    for face in faces:
        try:
            shape = shape_predictor(image_np, face)
            face_descriptor = facerec.compute_face_descriptor(image_np, shape, 1)
            embeddings.append(np.array(face_descriptor))
        except Exception:
            # Skip faces dlib can't process (bad crop, extreme angle, etc.)
            # instead of failing the whole photo.
            continue

    return embeddings


def identify_face(
    embedding: np.ndarray,
    candidates: list[dict],
    threshold: float = None,
) -> tuple[int | None, float]:
    """
    Compares one face embedding against a list of candidate students and
    returns whichever one is closest, if it's close enough.

    candidates: list of {"student_id": int, "face_embedding": list[float]}
    Returns: (student_id or None, distance_score)
    """
    threshold = threshold if threshold is not None else settings.FACE_MATCH_THRESHOLD

    best_id = None
    best_distance = float("inf")

    for candidate in candidates:
        stored = candidate.get("face_embedding")
        if not stored:
            continue
        distance = np.linalg.norm(np.array(stored) - embedding)
        if distance < best_distance:
            best_distance = distance
            best_id = candidate["student_id"]

    if best_id is not None and best_distance <= threshold:
        return best_id, best_distance
    return None, best_distance


def identify_faces_in_photo(
    image_np: np.ndarray,
    candidates: list[dict],
    threshold: float = None,
) -> tuple[dict[int, float], int]:
    """
    For a classroom group photo: detects every face and matches each one
    against the candidate list independently.

    Returns: ({student_id: distance_score, ...}, num_faces_detected)
    """
    embeddings = get_face_embeddings(image_np)
    detected: dict[int, float] = {}

    for embedding in embeddings:
        student_id, distance = identify_face(embedding, candidates, threshold)
        if student_id is not None:
            # if somehow matched more than once in the same photo, keep the closer match
            if student_id not in detected or distance < detected[student_id]:
                detected[student_id] = distance

    return detected, len(embeddings)
