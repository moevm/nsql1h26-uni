from fastapi import APIRouter, Depends, HTTPException
from app.database.universities_db import UniversitiesDataBase
from app.core.dependencies import get_db_connection
from app.models import AdminCreate, AdminLogin

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

    result = admins_controller.add_admin(admin.username, admin.password)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to create admin")

    return {"username": result, "message": "Admin created successfully"}

@router.post("/login")
async def login_admin(
    admin: AdminLogin,
    db: UniversitiesDataBase = Depends(get_db_connection)
):
    """Логин админа"""
    admins_controller = db.get_admins_collection()
    if not admins_controller:
        raise HTTPException(status_code=500, detail="Database not available")

    admin_data = admins_controller.find_admin(admin.username, admin.password)
    if not admin_data:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    admin_data["_id"] = str(admin_data["_id"])
    return {"message": "Login successful", "admin": admin_data}