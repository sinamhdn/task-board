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

import logging
import sys


def setup_logging():
    root = logging.getLogger()
    root.setLevel(logging.DEBUG)

    # Remove any handlers already attached (e.g., by Uvicorn)
    for h in root.handlers[:]:
        root.removeHandler(h)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.DEBUG)
    handler.setFormatter(
        logging.Formatter(
            "%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
    )
    root.addHandler(handler)

    # Ensure all loggers propagate to root (they do by default, but be safe)
    for name in logging.root.manager.loggerDict:
        lg = logging.getLogger(name)
        lg.setLevel(logging.DEBUG)
        lg.propagate = True
        # Remove handlers so they don't duplicate output
        for h in lg.handlers[:]:
            lg.removeHandler(h)

    # Silence noisy third-party loggers
    for noisy in ("urllib3", "asyncio", "botocore", "httpx", "httpcore", "multipart"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


setup_logging()
