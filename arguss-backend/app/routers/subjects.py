from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import settings
from app.db import queries
from app.dependencies import require_teacher, require_student, require_subject_owner
from app.schemas.subject import SubjectCreateRequest, SubjectResponse, EnrollRequest

router = APIRouter(prefix="/subjects", tags=["subjects"])


# ---------- Teacher-facing ----------

@router.post("", response_model=list[dict], status_code=status.HTTP_201_CREATED)
def create_subject(payload: SubjectCreateRequest, teacher_id: int = Depends(require_teacher)):
    created = queries.create_subject(payload.subject_code, payload.name, payload.section, teacher_id)
    if not created:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Subject code may already be in use")
    return created


@router.get("/mine", response_model=list[SubjectResponse])
def list_my_subjects(teacher_id: int = Depends(require_teacher)):
    return queries.get_teacher_subjects(teacher_id)


@router.get("/lookup-invite/{invite_code}")
def lookup_invite(invite_code: str):
    """
    Public/optional-auth preview of an invite code — lets the join page
    show 'You've been invited to join X' before the student is logged in,
    without exposing anything beyond the subject name and instructor.
    """
    subject = queries.get_subject_by_invite_code(invite_code)
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid or expired invite code")

    teacher = queries.get_teacher_by_id(subject["teacher_id"]) if subject.get("teacher_id") else None

    return {
        "subject_name": subject["name"],
        "instructor": teacher["name"] if teacher else "Unknown",
        # No 'active/inactive' concept exists yet for subjects — every
        # subject that exists is considered active. Kept as a field so
        # the frontend doesn't need to change if that's added later.
        "is_active": True,
    }


@router.get("/{subject_id}/invite")
def get_invite_info(subject_id: int = Depends(require_subject_owner)):
    subject = queries.get_subject_by_id(subject_id)
    return {
        "subject_id": subject["subject_id"],
        "subject_name": subject["name"],
        "invite_code": subject["invite_code"],
        "invite_url": f"{settings.FRONTEND_URL}/join/{subject['invite_code']}",
    }


# ---------- Student-facing ----------

def _join_subject(invite_code: str, student_id: int):
    """
    Shared logic for enrolling a student by invite code. Idempotent by
    design: joining a class you're already in succeeds quietly instead
    of erroring, since that's the expected behavior when a student
    re-scans a QR code or re-clicks an old invite link.
    """
    subject = queries.get_subject_by_invite_code(invite_code)
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid or expired invite code")

    if queries.is_student_enrolled(subject["subject_id"], student_id):
        return {
            "status": "already_enrolled",
            "subject_id": subject["subject_id"],
            "message": f"You're already enrolled in {subject['name']}",
        }

    queries.enroll_student_to_subject(subject["subject_id"], student_id)
    return {
        "status": "enrolled",
        "subject_id": subject["subject_id"],
        "message": f"Successfully enrolled in {subject['name']}",
        "subject": subject,
    }


@router.post("/enroll", status_code=status.HTTP_200_OK)
def enroll_in_subject(payload: EnrollRequest, student_id: int = Depends(require_student)):
    return _join_subject(payload.invite_code, student_id)


@router.post("/join", status_code=status.HTTP_200_OK)
def join_subject(payload: EnrollRequest, student_id: int = Depends(require_student)):
    """Alias of /enroll with the same idempotent behavior — kept as a
    separate route since the QR/invite-link flow refers to it as 'join'."""
    return _join_subject(payload.invite_code, student_id)


@router.delete("/{subject_id}/enrollment", status_code=status.HTTP_204_NO_CONTENT)
def unenroll_from_subject(subject_id: int, student_id: int = Depends(require_student)):
    queries.unenroll_student_from_subject(subject_id, student_id)
    return None


@router.get("/enrolled")
def list_enrolled_subjects(student_id: int = Depends(require_student)):
    enrolled = queries.get_student_subjects(student_id)
    logs = queries.get_student_attendance(student_id)

    stats_map: dict[int, dict] = {}
    for log in logs:
        sid = log["subject_id"]
        stats_map.setdefault(sid, {"total": 0, "attended": 0})
        stats_map[sid]["total"] += 1
        if log.get("is_present"):
            stats_map[sid]["attended"] += 1

    results = []
    for node in enrolled:
        subject = node["subjects"]
        stats = stats_map.get(subject["subject_id"], {"total": 0, "attended": 0})
        results.append({**subject, "total_classes": stats["total"], "attended_classes": stats["attended"]})

    return results