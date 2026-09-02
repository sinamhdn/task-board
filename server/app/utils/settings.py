from pathlib import Path

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_DIR = Path(__file__).resolve().parent.parent.parent
# from dotenv import dotenv_values

"""# --- DEBUGGING BLOCK ---
env_file_path = ENV_DIR / ".env"
print(f"1. Looking for .env at: {env_file_path}")
print(f"2. File exists? {env_file_path.exists()}")

# Read the .env file manually to see what keys are inside
loaded_vars = dotenv_values(env_file_path)
print(f"3. Keys found in .env: {list(loaded_vars.keys())}")
print(f"4. Full content: {loaded_vars}")
# --- END DEBUGGING ---"""


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_DIR / ".env", env_file_encoding="utf-8", case_sensitive=False
    )
    database_url: str
    database_url_async: str
    database_user: str
    database_pass: str
    jwt_secret_key: SecretStr
    jwt_algorithm: str
    jwt_expire_delta_minutes: int = 30
    is_local_static_dir: bool
    front_end_origins: list[str]


settings = Settings()
