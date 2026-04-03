from app.database.dependencies import get_db
from fastapi import HTTPException

def get_db_connection():
    db = get_db()
    if not db.connect_to_db():
        raise HTTPException(status_code=500, detail="Could not connect to database")
    try:
        yield db
    finally:
        db.close_db()