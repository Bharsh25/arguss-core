"""
Data access layer. This is almost identical to the Streamlit app's db.py —
it never actually depended on Streamlit, so it ports over as-is. The only
additions are get_subject_by_id() and get_subject_students_with_faces() /
get_subject_students_with_voices(), which the API needs for authorization
checks and for feeding embeddings straight into the ML pipeline.
"""

import secrets
import string

from app.db.supabase_client import supabase
from app.core.security import hash_password


def _generate_invite_code(length: int = 6) -> str:
    """Short random code students use to join a class — separate from the
    human-chosen subject_code, so enrollment can't be guessed from it."""
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


# ---------- Teacher functions ----------

def check_teacher_exists(username: str) -> bool:
    response = supabase.table('teachers').select('username').eq('username', username.strip()).execute()
    return len(response.data) > 0


def get_teacher_by_username(username: str):
    response = supabase.table('teachers').select('*').eq('username', username.strip()).execute()
    return response.data[0] if response.data else None


def get_teacher_by_id(teacher_id: int):
    response = supabase.table('teachers').select('*').eq('teacher_id', teacher_id).execute()
    return response.data[0] if response.data else None


def create_teacher(username: str, password: str, name: str):
    data = {
        'username': username.strip(),
        'password_hash': hash_password(password),
        'name': name
    }
    try:
        response = supabase.table('teachers').insert(data).execute()
        return response.data
    except Exception:
        return None  # most likely a duplicate username


# ---------- Student functions ----------

def get_all_students():
    response = supabase.table("students").select('*').execute()
    return response.data


def get_student_by_id(student_id: int):
    response = supabase.table('students').select('*').eq('student_id', student_id).execute()
    return response.data[0] if response.data else None


def get_students_for_subject(subject_id: int):
    """Only the students enrolled in one specific subject — used so the
    attendance pipeline never matches a student from a different class."""
    response = (
        supabase.table("subject_students")
        .select("students(*)")
        .eq("subject_id", subject_id)
        .execute()
    )
    return [row['students'] for row in response.data if row.get('students')]


def create_student(new_name: str, face_embedding=None, voice_embedding=None):
    data = {
        "name": new_name,
        "face_embedding": face_embedding,
        "voice_embedding": voice_embedding
    }
    response = supabase.table('students').insert(data).execute()
    return response.data


# ---------- Subject functions ----------

def create_subject(subject_code: str, name: str, section: str, teacher_id: int):
    data = {
        "subject_code": subject_code,
        "name": name,
        "section": section,
        "teacher_id": teacher_id,
        "invite_code": _generate_invite_code(),
    }
    response = supabase.table("subjects").insert(data).execute()
    return response.data


def get_subject_by_invite_code(invite_code: str):
    response = supabase.table("subjects").select("*").eq("invite_code", invite_code.strip().upper()).execute()
    return response.data[0] if response.data else None


def get_subject_by_id(subject_id: int):
    response = supabase.table("subjects").select("*").eq("subject_id", subject_id).execute()
    return response.data[0] if response.data else None


def get_subject_by_code(subject_code: str):
    response = supabase.table("subjects").select("*").eq("subject_code", subject_code.strip()).execute()
    return response.data[0] if response.data else None


def get_teacher_subjects(teacher_id: int):
    response = (
        supabase.table("subjects")
        .select("*,subject_students(count),attendance_logs(timestamp)")
        .eq("teacher_id", teacher_id)
        .execute()
    )
    subjects = response.data

    for sub in subjects:
        sub['total_students'] = (
            sub.get("subject_students", [{}])[0].get("count", 0)
            if sub.get("subject_students") else 0
        )
        attendance = sub.get("attendance_logs", [])
        # Assumes every student marked present in the same photo/voice
        # session shares one timestamp (true because create_attendance()
        # always does one bulk insert with a single server-generated time).
        unique_sessions = len(set(log['timestamp'] for log in attendance))
        sub["total_classes"] = unique_sessions

        sub.pop("subject_students", None)
        sub.pop("attendance_logs", None)

    return subjects


def is_student_enrolled(subject_id: int, student_id: int) -> bool:
    response = (
        supabase.table("subject_students")
        .select("*")
        .eq("subject_id", subject_id)
        .eq("student_id", student_id)
        .execute()
    )
    return len(response.data) > 0


def enroll_student_to_subject(subject_id: int, student_id: int):
    data = {"subject_id": subject_id, "student_id": student_id}
    try:
        response = supabase.table("subject_students").insert(data).execute()
        return response.data
    except Exception:
        return None  # already enrolled


def unenroll_student_from_subject(subject_id: int, student_id: int):
    response = (
        supabase.table("subject_students")
        .delete()
        .eq("subject_id", subject_id)
        .eq("student_id", student_id)
        .execute()
    )
    return response.data


def get_student_subjects(student_id: int):
    response = supabase.table('subject_students').select('*, subjects(*)').eq('student_id', student_id).execute()
    return response.data


# ---------- Attendance functions ----------

def get_student_attendance(student_id: int):
    response = supabase.table("attendance_logs").select("*,subjects(*)").eq("student_id", student_id).execute()
    return response.data


def get_subject_attendance(subject_id: int):
    response = supabase.table("attendance_logs").select("*,students(*)").eq("subject_id", subject_id).execute()
    return response.data


def create_attendance(logs: list[dict]):
    response = supabase.table("attendance_logs").insert(logs).execute()
    return response.data