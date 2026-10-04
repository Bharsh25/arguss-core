import io

import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from PIL import Image

from app.core.security import create_access_token, verify_password
from app.db import queries
from app.ml.face_pipeline import get_face_embeddings, identify_face
from app.ml.voice_pipeline import get_voice_embedding
from app.schemas.auth import (
    TeacherRegisterRequest,
    TeacherLoginRequest,
    TokenResponse,
    StudentIdentifyResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


# ---------- Teacher auth ----------

@router.post("/teacher/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_teacher(payload: TeacherRegisterRequest):
    if queries.check_teacher_exists(payload.username):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username is already taken")

    created = queries.create_teacher(payload.username, payload.password, payload.name)
    if not created:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create account")

    teacher = created[0]
    token = create_access_token(subject=teacher["teacher_id"], role="teacher")
    return TokenResponse(access_token=token, role="teacher", id=teacher["teacher_id"], name=teacher["name"])


@router.post("/teacher/login", response_model=TokenResponse)
def login_teacher(payload: TeacherLoginRequest):
    teacher = queries.get_teacher_by_username(payload.username)
    if not teacher or not verify_password(payload.password, teacher["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    token = create_access_token(subject=teacher["teacher_id"], role="teacher")
    return TokenResponse(access_token=token, role="teacher", id=teacher["teacher_id"], name=teacher["name"])


# ---------- Student auth (FaceID — no password) ----------

async def _read_image_as_np(photo: UploadFile) -> np.ndarray:
    contents = await photo.read()
    try:
        return np.array(Image.open(io.BytesIO(contents)).convert("RGB"))
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not read the uploaded image")


@router.post("/student/identify", response_model=StudentIdentifyResponse)
async def identify_student(photo: UploadFile = File(...)):
    """
    Equivalent to the Streamlit student login screen: capture a face,
    check it against every registered student. If matched, issue a token.
    If not, the frontend should fall back to the registration flow.
    """
    image_np = await _read_image_as_np(photo)
    embeddings = get_face_embeddings(image_np)

    if len(embeddings) == 0:
        return StudentIdentifyResponse(matched=False, message="No face detected. Ensure good lighting and try again.")
    if len(embeddings) > 1:
        return StudentIdentifyResponse(matched=False, message="Multiple faces detected. Only one person should be in frame.")

    all_students = queries.get_all_students()
    student_id, _ = identify_face(embeddings[0], all_students)

    if student_id is None:
        return StudentIdentifyResponse(matched=False, message="Face not recognized. Please register.")

    student = queries.get_student_by_id(student_id)
    token = create_access_token(subject=student["student_id"], role="student")
    return StudentIdentifyResponse(
        matched=True,
        message=f"Welcome back, {student['name']}!",
        token=TokenResponse(access_token=token, role="student", id=student["student_id"], name=student["name"]),
    )


@router.post("/student/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_student(
    name: str = Form(...),
    photo: UploadFile = File(...),
    voice: UploadFile | None = File(None),
):
    image_np = await _read_image_as_np(photo)
    embeddings = get_face_embeddings(image_np)

    if len(embeddings) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No face detected in the photo")
    if len(embeddings) > 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Multiple faces detected — only one person should be in frame")

    voice_embedding = None
    if voice is not None:
        try:
            voice_bytes = await voice.read()
            if voice_bytes:
                # Safely attempt to parse voice bytes
                voice_embedding = get_voice_embedding(voice_bytes)
        except Exception as e:
            # Gracefully catch container/codec decoding limitations on Windows
            print(f"Notice: Voice embedding skipped due to codec format: {e}")
            voice_embedding = None  

    created = queries.create_student(name, face_embedding=embeddings[0].tolist(), voice_embedding=voice_embedding)
    if not created:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create student account")

    student = created[0]
    token = create_access_token(subject=student["student_id"], role="student")
    return TokenResponse(access_token=token, role="student", id=student["student_id"], name=student["name"])