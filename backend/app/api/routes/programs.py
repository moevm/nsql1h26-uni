from fastapi import APIRouter, Depends, Header, HTTPException, Query

from app.core.dependencies import get_db_connection
from app.database.universities_db import UniversitiesDataBase
from app.models import ProgramCreate, ProgramUpdate

router = APIRouter(prefix="/programs", tags=["programs"])


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


@router.get("/")
async def get_programs(
    university_id: str | None = None,
    name: str | None = None,
    min_budget_places: int | None = None,
    max_budget_places: int | None = None,
    min_paid_places: int | None = None,
    max_paid_places: int | None = None,
    min_passing_score: int | None = None,
    max_passing_score: int | None = None,
    form_of_education: str | None = None,
    required_subjects: str | None = None,
    page: int = Query(1, ge=1, description="Номер страницы"),
    limit: int = Query(10, ge=1, le=100, description="Количество записей на странице"),
    db: UniversitiesDataBase = Depends(get_db_connection),
):
    programs_controller = db.get_programs_collection()
    if not programs_controller:
        raise HTTPException(status_code=500, detail="База данных недоступна")

    budget_places = None
    if min_budget_places is not None or max_budget_places is not None:
        budget_places = (min_budget_places, max_budget_places)

    paid_places = None
    if min_paid_places is not None or max_paid_places is not None:
        paid_places = (min_paid_places, max_paid_places)

    passing_score = None
    if min_passing_score is not None or max_passing_score is not None:
        passing_score = (min_passing_score, max_passing_score)

    subjects_list = None
    if required_subjects:
        subjects_list = [subject.strip() for subject in required_subjects.split(",") if subject.strip()]

    programs, total_count = programs_controller.find_programs_by_filters(
        university_id=university_id,
        name=name,
        budget_places=budget_places,
        paid_places=paid_places,
        passing_score=passing_score,
        form_of_education=form_of_education,
        required_subjects=subjects_list,
        page=page,
        limit=limit,
    )

    for program in programs:
        program["_id"] = str(program["_id"])
        program["university_id"] = str(program["university_id"])
    
    return {
        "items": programs,
        "total": total_count,
        "page": page,
        "limit": limit,
        "pages": (total_count + limit - 1) // limit  # количество страниц
    }


@router.get("/{program_id}")
async def get_program(program_id: str, db: UniversitiesDataBase = Depends(get_db_connection)):
    programs_controller = db.get_programs_collection()
    if not programs_controller:
        raise HTTPException(status_code=500, detail="База данных недоступна")

    program = programs_controller.find_program_by_id(program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Направление не найдено")

    program["_id"] = str(program["_id"])
    program["university_id"] = str(program["university_id"])
    return program


@router.post("/", status_code=201)
async def create_program(
    program: ProgramCreate,
    admin: dict = Depends(get_current_admin),
    db: UniversitiesDataBase = Depends(get_db_connection),
):
    del admin
    programs_controller = db.get_programs_collection()
    if not programs_controller:
        raise HTTPException(status_code=500, detail="База данных недоступна")

    program_id = programs_controller.add_program(
        university_id=program.university_id,
        code=program.code,
        name=program.name,
        budget_places=program.budget_places,
        paid_places=program.paid_places,
        passing_score=program.passing_score,
        form_of_education=program.form_of_education,
        required_subjects=program.required_subjects,
        comment=program.comment,
    )

    if not program_id:
        raise HTTPException(status_code=500, detail="Не удалось создать направление")

    return {"id": str(program_id), "message": "Направление успешно создано"}


@router.put("/{program_id}")
async def update_program(
    program_id: str,
    program: ProgramUpdate,
    admin: dict = Depends(get_current_admin),
    db: UniversitiesDataBase = Depends(get_db_connection),
):
    del admin
    programs_controller = db.get_programs_collection()
    if not programs_controller:
        raise HTTPException(status_code=500, detail="База данных недоступна")

    existing = programs_controller.find_program_by_id(program_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Направление не найдено")

    success = programs_controller.update_program(
        program_id=program_id,
        university_id=program.university_id,
        code=program.code,
        name=program.name,
        budget_places=program.budget_places,
        paid_places=program.paid_places,
        passing_score=program.passing_score,
        form_of_education=program.form_of_education,
        required_subjects=program.required_subjects,
        comment=program.comment,
    )

    if not success:
        raise HTTPException(status_code=500, detail="Не удалось обновить направление")

    return {"message": "Направление успешно обновлено"}


@router.delete("/{program_id}")
async def delete_program(
    program_id: str,
    admin: dict = Depends(get_current_admin),
    db: UniversitiesDataBase = Depends(get_db_connection),
):
    del admin
    programs_controller = db.get_programs_collection()
    if not programs_controller:
        raise HTTPException(status_code=500, detail="База данных недоступна")

    success = programs_controller.delete_program(program_id)
    if not success:
        raise HTTPException(status_code=404, detail="Направление не найдено")

    return {"message": "Направление успешно удалено"}
