import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareBuddy AI"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"
    AI_PROVIDER: str = "mock"
    DATABASE_URL: str = "sqlite:///./carebuddy.db"
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
