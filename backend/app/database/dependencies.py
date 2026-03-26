from .universities_db import UniversitiesBataBase
import os
from dotenv import load_dotenv

load_dotenv()

_db_instance = None

def get_db():
    global _db_instance
    if _db_instance is None:
        _db_instance = UniversitiesBataBase(
            f"{os.getenv('DATABASE_TYPE')}://{os.getenv('DATABASE_HOST')}:{os.getenv('DATABASE_PORT')}/",
            os.getenv('DATABASE_NAME')
        )
    return _db_instance