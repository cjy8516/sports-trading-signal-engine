from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    txline_base_url: str = "https://txline-dev.txodds.com/api"

    txline_jwt: str
    txline_api_token: str

    log_level: str = "INFO"


settings = Settings()