from pydantic import BaseModel


class AttendanceCandidate(BaseModel):
    """One row in the review screen before a teacher confirms attendance —
    mirrors the 'review before saving' step from the Streamlit dialog."""
    student_id: int
    name: str
    is_present: bool
    match_source: str  # e.g. "Face (0.42)" or "Voice (0.71)" or "-"


class AttendancePreviewResponse(BaseModel):
    candidates: list[AttendanceCandidate]
    faces_detected: int | None = None
    total_enrolled: int


class AttendanceConfirmRequest(BaseModel):
    records: list[AttendanceCandidate]


class AttendanceLogResponse(BaseModel):
    id: int
    student_id: int
    subject_id: int
    timestamp: str
    is_present: bool
