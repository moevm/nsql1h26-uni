from fastapi import APIRouter, Depends, HTTPException
from app.database.universities_db import UniversitiesDataBase
from app.core.dependencies import get_db_connection
from app.models import UniversityCreate, UniversityUpdate

router = APIRouter(prefix="/universities", tags=["universities"])

@router.get("/")
async def get_all_universities(db: UniversitiesDataBase = Depends(get_db_connection)):
    """Получить все университеты"""
    universities_controller = db.get_universities_collection()
    if not universities_controller:
        raise HTTPException(status_code=500, detail="Database not available")

    universities = universities_controller.find_universities_by_filters()
    for uni in universities:
        uni["_id"] = str(uni["_id"])
    return universities

@router.get("/{university_id}")
async def get_university(university_id: str, db: UniversitiesDataBase = Depends(get_db_connection)):
    """Получить университет по ID"""
    universities_controller = db.get_universities_collection()
    if not universities_controller:
        raise HTTPException(status_code=500, detail="Database not available")

    university = universities_controller.find_university_by_id(university_id)
    if not university:
        raise HTTPException(status_code=404, detail="University not found")

    university["_id"] = str(university["_id"])
    return university

@router.get("/search/by-name/{name}")
async def search_universities_by_name(name: str, db: UniversitiesDataBase = Depends(get_db_connection)):
    """Поиск университетов по префиксу названия"""
    universities_controller = db.get_universities_collection()
    if not universities_controller:
        raise HTTPException(status_code=500, detail="Database not available")

    universities = universities_controller.find_universities_by_prefix(name)
    for uni in universities:
        uni["_id"] = str(uni["_id"])
    return universities

@router.post("/", status_code=201)
async def create_university(
    university: UniversityCreate,
    db: UniversitiesDataBase = Depends(get_db_connection)
):
    """Создать новый университет"""
    universities_controller = db.get_universities_collection()
    if not universities_controller:
        raise HTTPException(status_code=500, detail="Database not available")

    existing = universities_controller.find_university_by_name(university.name)
    if existing:
        raise HTTPException(status_code=400, detail="University with this name already exists")

    university_id = universities_controller.add_university(
        name=university.name,
        city=university.city,
        has_dormitory=university.has_dormitory,
        military_dept=university.military_dept,
        website=university.website,
        comment=university.comment
    )

    if not university_id:
        raise HTTPException(status_code=500, detail="Failed to create university")

    return {"id": university_id, "message": "University created successfully"}

@router.put("/{university_id}")
async def update_university(
    university_id: str,
    university: UniversityUpdate,
    db: UniversitiesDataBase = Depends(get_db_connection)
):
    """Обновить информацию об университете"""
    universities_controller = db.get_universities_collection()
    if not universities_controller:
        raise HTTPException(status_code=500, detail="Database not available")

    existing = universities_controller.find_university_by_id(university_id)
    if not existing:
        raise HTTPException(status_code=404, detail="University not found")

    success = universities_controller.update_university(
        id_str=university_id,
        name=university.name,
        city=university.city,
        has_dormitory=university.has_dormitory,
        military_dept=university.military_dept,
        website=university.website,
        comment=university.comment
    )

    if not success:
        raise HTTPException(status_code=500, detail="Failed to update university")

    return {"message": "University updated successfully"}

@router.delete("/{university_id}")
async def delete_university(university_id: str, db: UniversitiesDataBase = Depends(get_db_connection)):
    """Удалить университет"""
    universities_controller = db.get_universities_collection()
    if not universities_controller:
        raise HTTPException(status_code=500, detail="Database not available")

    success = universities_controller.delete_university(university_id)
    if not success:
        raise HTTPException(status_code=404, detail="University not found")

    return {"message": "University deleted successfully"}