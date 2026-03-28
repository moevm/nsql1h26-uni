from .universities_db import UniversitiesDataBase
import os
from dotenv import load_dotenv

load_dotenv()

_db_instance = None

def check_db_env(*arrayEnvElements):
    elementsEnvNotFound = []
    for el in arrayEnvElements:
        if not os.getenv(el):
            elementsEnvNotFound.append(el)
    if elementsEnvNotFound:
        raise Exception(f"Invalid .env file, not found: {', '.join(elementsEnvNotFound)}")

def get_db():
    global _db_instance
    if _db_instance is None:

        check_db_env('DATABASE_TYPE', 'DATABASE_HOST', 'DATABASE_PORT', 'DATABASE_NAME')

        _db_instance = UniversitiesDataBase(
            f"{os.getenv('DATABASE_TYPE')}://{os.getenv('DATABASE_HOST')}:{os.getenv('DATABASE_PORT')}/",
            os.getenv('DATABASE_NAME')
        )
    return _db_instance