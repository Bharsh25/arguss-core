import io
from datetime import datetime, timezone

import numpy as np
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from PIL import Image

from app.db import queries
from app.dependencies import require_student, require_subject_owner
from app.ml.face_pipeline import identify_faces_in_photo
from app.ml.voice_pipeline import process_bulk_audio
from app.schemas.attendance import (
    AttendanceCandidate,
    AttendancePreviewResponse,
    AttendanceConfirmRequest,
)

router = APIRouter(prefix="/attendance", tags=["attendance"])


def _build_candidate_list(enrolled: list[dict], detected: dict[int, float], source_label: str) -> list[AttendanceCandidate]:
    """Turns {student_id: score} into the full present/absent review list
    for every enrolled student — mirrors the Streamlit review dialog."""
    candidates = []
    for student in enrolled:
        sid = student["student_id"]
        is_present = sid in detected
        source = f"{source_label} ({detected[sid]:.2f})" if is_present else "-"
        candidates.append(AttendanceCandidate(
            student_id=sid, name=student["name"], is_present=is_present, match_source=source
        ))
    return candidates


@router.post("/{subject_id}/photo", response_model=AttendancePreviewResponse)
async def preview_attendance_from_photos(
    photos: list[UploadFile] = File(...),
    subject_id: int = Depends(require_subject_owner),
):
    """
    Takes one or more classroom photos, matches every detected face
    against the subject's enrolled students, and returns a preview for
    the teacher to review — nothing is saved yet (see /confirm).
    """
    enrolled = queries.get_students_for_subject(subject_id)
    if not enrolled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No students enrolled in this subject")

    detected: dict[int, float] = {}
    total_faces = 0

    for photo in photos:
        contents = await photo.read()
        try:
            image_np = np.array(Image.open(io.BytesIO(contents)).convert("RGB"))
        except Exception:
            continue  # skip unreadable files rather than failing the whole batch

        photo_detected, num_faces = identify_faces_in_photo(image_np, enrolled)
        total_faces += num_faces
        for sid, score in photo_detected.items():
            if sid not in detected or score < detected[sid]:
                detected[sid] = score

    candidates = _build_candidate_list(enrolled, detected, "Face")
    return AttendancePreviewResponse(candidates=candidates, faces_detected=total_faces, total_enrolled=len(enrolled))


@router.post("/{subject_id}/voice", response_model=AttendancePreviewResponse)
async def preview_attendance_from_voice(
    audio: UploadFile = File(...),
    subject_id: int = Depends(require_subject_owner),
):
    enrolled = queries.get_students_for_subject(subject_id)
    if not enrolled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No students enrolled in this subject")

    voice_candidates = {s["student_id"]: s["voice_embedding"] for s in enrolled if s.get("voice_embedding")}
    if not voice_candidates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No enrolled students have a registered voice profile")

    audio_bytes = await audio.read()
    detected = process_bulk_audio(audio_bytes, voice_candidates)

    candidates = _build_candidate_list(enrolled, detected, "Voice")
    return AttendancePreviewResponse(candidates=candidates, faces_detected=None, total_enrolled=len(enrolled))


@router.post("/{subject_id}/confirm", status_code=status.HTTP_201_CREATED)
def confirm_attendance(payload: AttendanceConfirmRequest, subject_id: int = Depends(require_subject_owner)):
    """
    Writes the reviewed attendance list to the database. All rows share
    one server-generated timestamp so the 'sessions held' count on the
    subject stays accurate (see get_teacher_subjects()'s docstring note).
    """
    timestamp = datetime.now(timezone.utc).isoformat()
    logs = [
        {
            "student_id": record.student_id,
            "subject_id": subject_id,
            "timestamp": timestamp,
            "is_present": record.is_present,
        }
        for record in payload.records
    ]
    created = queries.create_attendance(logs)
    return {"message": "Attendance recorded", "count": len(created)}


@router.get("/{subject_id}/history")
def get_subject_history(subject_id: int = Depends(require_subject_owner)):
    return queries.get_subject_attendance(subject_id)


@router.get("/me")
def get_my_attendance(student_id: int = Depends(require_student)):
    return queries.get_student_attendance(student_id)