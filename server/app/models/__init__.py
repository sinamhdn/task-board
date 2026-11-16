import logging

logger = logging.getLogger(f"models init logger: Filename -> {__name__}")

logger.info(">>> app.models.__init__ START")

from .boards import Board

logger.info(">>> boards ok")
from .cards import Card

logger.info(">>> cards ok")
from .lists import List

logger.info(">>> lists ok")
from .members import members_table

logger.info(">>> members ok")
from .users import User

logger.info(">>> users ok")

__all__ = ["User", "Board", "List", "Card", "members_table"]
logger.info(">>> app.models.__init__ DONE")
