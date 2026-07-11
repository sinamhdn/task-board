from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    jwt_secret_key: SecretStr
    jwt_algorithm: str
    jwt_expire_delta_minutes: int = 30


settings = Settings()
