from fastapi import APIRouter, Depends, HTTPException, Header
from app.database.universities_db import UniversitiesDataBase
from app.core.dependencies import get_db_connection
from app.models import UniversityCreate, UniversityUpdate

router = APIRouter(prefix="/universities", tags=["universities"])


# Вспомогательная функция для проверки аутентификации администратора
async def get_current_admin(
        x_user_id: str = Header(...),  # Получаем ID из заголовка
        db: UniversitiesDataBase = Depends(get_db_connection)
):
    """Проверяет существование администратора и возвращает его данные"""
    admins_controller = db.get_admins_collection()
    if not admins_controller:
        raise HTTPException(status_code=500, detail="База данных недоступна")

    # Проверяем, существует ли админ с таким ID
    admin = admins_controller.find_admin_by_id(x_user_id)
    if not admin:
        raise HTTPException(status_code=401, detail="Не аутентифицирован")

    return admin

@router.get("/")
async def get_all_universities(db: UniversitiesDataBase = Depends(get_db_connection)):
    """Получить все университеты"""
    universities_controller = db.get_universities_collection()
    if not universities_controller:
        raise HTTPException(status_code=500, detail="База данных недоступна")

    universities = universities_controller.find_universities_by_filters()
    for uni in universities:
        uni["_id"] = str(uni["_id"])
    return universities


@router.get("/{university_id}")
async def get_university(university_id: str, db: UniversitiesDataBase = Depends(get_db_connection)):
    """Получить университет по ID"""
    universities_controller = db.get_universities_collection()
    if not universities_controller:
        raise HTTPException(status_code=500, detail="База данных недоступна")

    university = universities_controller.find_university_by_id(university_id)
    if not university:
        raise HTTPException(status_code=404, detail="Университет не найден")

    university["_id"] = str(university["_id"])
    return university


@router.get("/search/by-name/{name}")
async def search_universities_by_name(name: str, db: UniversitiesDataBase = Depends(get_db_connection)):
    """Поиск университетов по префиксу названия"""
    universities_controller = db.get_universities_collection()
    if not universities_controller:
        raise HTTPException(status_code=500, detail="База данных недоступна")

    universities = universities_controller.find_universities_by_prefix(name)
    for uni in universities:
        uni["_id"] = str(uni["_id"])
    return universities


@router.post("/", status_code=201)
async def create_university(
        university: UniversityCreate,
        admin: dict = Depends(get_current_admin),
        db: UniversitiesDataBase = Depends(get_db_connection)
):
    """Создать новый университет (требуется аутентификация администратора)"""
    universities_controller = db.get_universities_collection()
    if not universities_controller:
        raise HTTPException(status_code=500, detail="База данных недоступна")

    existing = universities_controller.find_university_by_name(university.name)
    if existing:
        raise HTTPException(status_code=400, detail="Университет с таким названием уже существует")

    university_id = universities_controller.add_university(
        name=university.name,
        city=university.city,
        has_dormitory=university.has_dormitory,
        military_dept=university.military_dept,
        website=university.website,
        comment=university.comment
    )

    if not university_id:
        raise HTTPException(status_code=500, detail="Не удалось создать университет")

    return {"id": university_id, "message": "Университет успешно создан"}


@router.put("/{university_id}")
async def update_university(
        university_id: str,
        university: UniversityUpdate,
        admin: dict = Depends(get_current_admin),
        db: UniversitiesDataBase = Depends(get_db_connection)
):
    """Обновить информацию об университете (требуется аутентификация администратора)"""
    universities_controller = db.get_universities_collection()
    if not universities_controller:
        raise HTTPException(status_code=500, detail="База данных недоступна")

    existing = universities_controller.find_university_by_id(university_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Университет не найден")

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
        raise HTTPException(status_code=500, detail="Не удалось обновить университет")

    return {"message": "Университет успешно обновлен"}


@router.delete("/{university_id}")
async def delete_university(
        university_id: str,
        admin: dict = Depends(get_current_admin),
        db: UniversitiesDataBase = Depends(get_db_connection)
):
    """Удалить университет (требуется аутентификация администратора)"""
    universities_controller = db.get_universities_collection()
    if not universities_controller:
        raise HTTPException(status_code=500, detail="База данных недоступна")

    success = universities_controller.delete_university(university_id)
    if not success:
        raise HTTPException(status_code=404, detail="Университет не найден")

    return {"message": "Университет успешно удален"}