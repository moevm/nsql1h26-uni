from fastapi import APIRouter, Depends
from src.db.DataBaseUniversitiesController import DataBaseUniversitiesController
from src.db.dependencies import get_db
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()


@router.get("/")
def home():
    return {"message": "Hello World"}

@router.get("/admins")
def admins(db: DataBaseUniversitiesController = Depends(get_db)):
    return {"admins": db.get_admins()}

@router.get("/add_test_admin")
def add_test_admin(db: DataBaseUniversitiesController = Depends(get_db)):
    db.add_admin("test", "qwerty")

@router.get("/remove_test_admin")
def remove_test_admin(db: DataBaseUniversitiesController = Depends(get_db)):
    db.remove_admin("test")