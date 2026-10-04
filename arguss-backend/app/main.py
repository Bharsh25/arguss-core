from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.ml.face_pipeline import load_dlib_models
from app.ml.voice_pipeline import load_voice_encoder
from app.routers import auth, subjects, attendance


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Preload the ML models once at startup so the first request isn't
    # slow (equivalent to Streamlit's @st.cache_resource loading on first
    # call — here we just do it eagerly instead of lazily).
    load_dlib_models()
    load_voice_encoder()
    yield


app = FastAPI(
    title="Arguss API",
    description="AI-based facial & voice attendance system.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(subjects.router)
app.include_router(attendance.router)


@app.get("/health", tags=["meta"])
def health_check():
    return {"status": "ok"}
