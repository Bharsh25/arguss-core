from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central app configuration, loaded from a .env file (see .env.example).
    Nothing here should ever be hardcoded in the actual code — that's the
    whole point of pulling it out into one place.
    """
    SUPABASE_URL: str
    SUPABASE_KEY: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Comma-separated list of origins allowed to call this API
    # (your React dev server, and later your deployed frontend URL)
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Used to build shareable invite URLs (e.g. FRONTEND_URL/join/<code>)
    FRONTEND_URL: str = "http://localhost:5173"

    # Face/voice matching thresholds — same defaults as the Streamlit version
    FACE_MATCH_THRESHOLD: float = 0.6
    VOICE_MATCH_THRESHOLD: float = 0.65

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()