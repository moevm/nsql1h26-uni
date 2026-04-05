from fastapi import APIRouter, Depends, HTTPException
from app.database.universities_db import UniversitiesDataBase
from app.core.dependencies import get_db_connection
from app.models import AdminCreate, AdminLogin
from .utils import get_hash_by_username_password

router = APIRouter(prefix="/admins", tags=["admins"])


@router.post("/", status_code=201)
async def create_admin(
        admin: AdminCreate,
        db: UniversitiesDataBase = Depends(get_db_connection)
):
    """Создать нового админа"""
    admins_controller = db.get_admins_collection()
    if not admins_controller:
        raise HTTPException(status_code=500, detail="Database not available")

    hashed_password = get_hash_by_username_password(admin.username, admin.password)
    result = admins_controller.add_admin(admin.username, hashed_password)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to create admin")

    # Возвращаем ID созданного администратора
    return {
        "id": str(result),  # Конвертируем ObjectId в строку
        "username": admin.username,
        "message": "Admin created successfully"
    }


@router.post("/login")
async def login_admin(
        admin: AdminLogin,
        db: UniversitiesDataBase = Depends(get_db_connection)
):
    """Логин админа - возвращает ID для использования в x-user-id заголовке"""
    admins_controller = db.get_admins_collection()
    if not admins_controller:
        raise HTTPException(status_code=500, detail="Database not available")

    hashed_password = get_hash_by_username_password(admin.username, admin.password)
    admin_data = admins_controller.find_admin_by_username_password(admin.username, hashed_password)
    if not admin_data:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Конвертируем ObjectId в строку для передачи клиенту
    admin_id = str(admin_data["_id"])

    return {
        "message": "Login successful",
        "admin_id": admin_id,  # Отдаем ID клиенту
        "username": admin_data["username"]
    }