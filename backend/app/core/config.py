from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


# .env lives at the project root (used for local dev, ignored on Lambda)
_ENV_FILE = Path(__file__).resolve().parents[3] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database
    DATABASE_URL: str = (
        "postgresql+asyncpg://darija:darija_pass@localhost:5432/darija_db"
    )

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 90

    # Claude / Anthropic (kept for backwards compatibility)
    ANTHROPIC_API_KEY: str = ""

    # AWS (Bedrock for AI conversations)
    AWS_REGION: str = "eu-west-3"

    # CORS - comma-separated string
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [
            origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()
        ]

    # Server
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000


settings = Settings()
