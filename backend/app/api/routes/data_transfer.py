import json
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.responses import Response

from app.core.dependencies import get_db_connection
from app.database.universities_db import UniversitiesDataBase

router = APIRouter(prefix="/data-transfer", tags=["data-transfer"])


def serialize_mongo_value(value):
    if isinstance(value, ObjectId):
        return str(value)

    if isinstance(value, datetime):
        return value.isoformat()

    if isinstance(value, list):
        return [serialize_mongo_value(item) for item in value]

    if isinstance(value, dict):
        return {key: serialize_mongo_value(item) for key, item in value.items()}

    return value


async def get_current_admin(
    x_user_id: str = Header(...),
    db: UniversitiesDataBase = Depends(get_db_connection),
):
    admins_controller = db.get_admins_collection()
    if not admins_controller:
        raise HTTPException(status_code=500, detail="База данных недоступна")

    admin = admins_controller.find_admin_by_id(x_user_id)
    if not admin:
        raise HTTPException(status_code=401, detail="Не аутентифицирован")

    return admin


@router.get("/export/json")
async def export_all_data_json(
    admin: dict = Depends(get_current_admin),
    db: UniversitiesDataBase = Depends(get_db_connection),
):
    del admin

    admins_controller = db.get_admins_collection()
    universities_controller = db.get_universities_collection()
    programs_controller = db.get_programs_collection()

    if not admins_controller or not universities_controller or not programs_controller:
        raise HTTPException(status_code=500, detail="База данных недоступна")

    admins = admins_controller.find_all_admins()
    universities = universities_controller.find_universities_by_filters()
    programs = programs_controller.find_programs_by_filters()

    payload = {
        "meta": {
            "exported_at": datetime.now().isoformat(),
            "version": "1.0",
            "format": "json",
        },
        "admins": serialize_mongo_value(admins),
        "universities": serialize_mongo_value(universities),
        "programs": serialize_mongo_value(programs),
    }

    filename = f"nsql-export-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"

    return Response(
        content=json.dumps(payload, ensure_ascii=False, indent=2),
        media_type="application/json",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )
