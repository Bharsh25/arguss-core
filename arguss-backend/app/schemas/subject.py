from pydantic import BaseModel, Field


class SubjectCreateRequest(BaseModel):
    subject_code: str = Field(..., min_length=2, max_length=20)
    name: str = Field(..., min_length=1, max_length=150)
    section: str = Field(..., min_length=1, max_length=20)


class SubjectResponse(BaseModel):
    subject_id: int
    subject_code: str
    name: str
    section: str
    invite_code: str | None = None
    total_students: int = 0
    total_classes: int = 0


class EnrollRequest(BaseModel):
    invite_code: str