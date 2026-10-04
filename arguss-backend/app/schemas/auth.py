from pydantic import BaseModel, Field


class TeacherRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=6)


class TeacherLoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    id: int
    name: str


class StudentIdentifyResponse(BaseModel):
    matched: bool
    token: TokenResponse | None = None
    message: str
