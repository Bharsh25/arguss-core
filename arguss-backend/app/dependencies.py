from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_access_token, InvalidToken
from app.db import queries

bearer_scheme = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    """Decodes the JWT and returns {"id": int, "role": "teacher"|"student"}."""
    try:
        payload = decode_access_token(credentials.credentials)
    except InvalidToken:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return {"id": int(payload["sub"]), "role": payload["role"]}


def require_teacher(user: dict = Depends(get_current_user)) -> int:
    """Use as a route dependency to require a teacher token. Returns teacher_id."""
    if user["role"] != "teacher":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher access required")
    return user["id"]


def require_student(user: dict = Depends(get_current_user)) -> int:
    """Use as a route dependency to require a student token. Returns student_id."""
    if user["role"] != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student access required")
    return user["id"]


def require_subject_owner(subject_id: int, teacher_id: int = Depends(require_teacher)) -> int:
    """
    Use on any route that takes a subject_id, to guarantee the calling
    teacher actually owns that subject. The Streamlit UI never needed this
    explicitly — it only ever showed a teacher their own subjects in the
    first place. A real API has to check this on every request, since
    anyone could otherwise pass any subject_id in the URL.
    """
    subject = queries.get_subject_by_id(subject_id)
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    if subject["teacher_id"] != teacher_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this subject")
    return subject_id
