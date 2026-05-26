import json
import csv
import io
import zipfile
from datetime import datetime
from xml.etree import ElementTree as ET

from bson import ObjectId
from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile
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


def parse_iso_datetime(value):
    if not isinstance(value, str):
        return value

    normalized = value.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(normalized)
    except ValueError:
        return value


def normalize_admin_record(record: dict) -> dict:
    required_fields = ("_id", "username", "password_hash", "createdAt")
    missing_fields = [field for field in required_fields if field not in record or record[field] in (None, "")]
    if missing_fields:
        missing_list = ", ".join(missing_fields)
        raise ValueError(f"admins[{record}]: отсутствуют обязательные поля: {missing_list}")

    normalized = dict(record)
    if "_id" in normalized and isinstance(normalized["_id"], str):
        normalized["_id"] = ObjectId(normalized["_id"])
    if "createdAt" in normalized:
        normalized["createdAt"] = parse_iso_datetime(normalized["createdAt"])
    return normalized


def normalize_university_record(record: dict) -> dict:
    required_fields = ("_id", "name", "city", "has_dormitory", "military_dept", "website")
    missing_fields = [field for field in required_fields if field not in record or record[field] in (None, "")]
    if missing_fields:
        missing_list = ", ".join(missing_fields)
        raise ValueError(f"universities[{record}]: отсутствуют обязательные поля: {missing_list}")

    normalized = dict(record)
    if "_id" in normalized and isinstance(normalized["_id"], str):
        normalized["_id"] = ObjectId(normalized["_id"])

    normalized["address"] = normalized.get("address") or ""
    normalized["foundation_year"] = normalized.get("foundation_year") if normalized.get("foundation_year") is not None else 0
    normalized["students_count"] = normalized.get("students_count") if normalized.get("students_count") is not None else 0
    normalized["faculties_count"] = normalized.get("faculties_count") if normalized.get("faculties_count") is not None else 0
    normalized["phone"] = normalized.get("phone") or ""
    normalized["email"] = normalized.get("email") or ""
    normalized["comment"] = normalized.get("comment") or ""
    normalized["rating"] = normalized.get("rating") if normalized.get("rating") is not None else 4.5
    normalized["programs_count"] = normalized.get("programs_count") if normalized.get("programs_count") is not None else 0

    created_at_value = normalized.get("createdAt")
    updated_at_value = normalized.get("updatedAt")
    normalized["createdAt"] = parse_iso_datetime(created_at_value) if created_at_value is not None else datetime.now()
    normalized["updatedAt"] = parse_iso_datetime(updated_at_value) if updated_at_value is not None else datetime.now()

    return normalized


def normalize_program_record(record: dict) -> dict:
    required_fields = (
        "_id",
        "university_id",
        "code",
        "name",
        "budget_places",
        "paid_places",
        "passing_score",
        "form_of_education",
        "required_subjects",
    )
    missing_fields = [field for field in required_fields if field not in record or record[field] in (None, "")]
    if missing_fields:
        missing_list = ", ".join(missing_fields)
        raise ValueError(f"programs[{record}]: отсутствуют обязательные поля: {missing_list}")

    normalized = dict(record)
    if "_id" in normalized and isinstance(normalized["_id"], str):
        normalized["_id"] = ObjectId(normalized["_id"])

    if "university_id" in normalized and isinstance(normalized["university_id"], str):
        normalized["university_id"] = ObjectId(normalized["university_id"])

    if isinstance(normalized.get("required_subjects"), dict):
        normalized["required_subjects"] = [
            {"subject": subject, "minimum_points": minimum_points}
            for subject, minimum_points in normalized["required_subjects"].items()
        ]

    normalized["comment"] = normalized.get("comment") or ""

    created_at_value = normalized.get("createdAt")
    updated_at_value = normalized.get("updatedAt")
    normalized["createdAt"] = parse_iso_datetime(created_at_value) if created_at_value is not None else datetime.now()
    normalized["updatedAt"] = parse_iso_datetime(updated_at_value) if updated_at_value is not None else datetime.now()

    return normalized


def get_all_collections_data(db: UniversitiesDataBase) -> tuple[list, list, list]:
    admins_controller = db.get_admins_collection()
    universities_controller = db.get_universities_collection()
    programs_controller = db.get_programs_collection()

    if not admins_controller or not universities_controller or not programs_controller:
        raise HTTPException(status_code=500, detail="База данных недоступна")

    admins = serialize_mongo_value(admins_controller.find_all_admins())
    universities = serialize_mongo_value(universities_controller.find_all_universities())
    programs = serialize_mongo_value(programs_controller.find_all_programs())
    
    return admins, universities, programs


def import_snapshot_json(db: UniversitiesDataBase, payload: dict, current_admin: dict) -> dict:
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Некорректный JSON: ожидается объект")

    required_sections = ("admins", "universities", "programs")
    for section in required_sections:
        if section not in payload:
            raise HTTPException(status_code=400, detail=f"Некорректный JSON: отсутствует секция '{section}'")
        if not isinstance(payload[section], list):
            raise HTTPException(status_code=400, detail=f"Секция '{section}' должна быть массивом")

    admins_controller = db.get_admins_collection()
    universities_controller = db.get_universities_collection()
    programs_controller = db.get_programs_collection()

    if not admins_controller or not universities_controller or not programs_controller:
        raise HTTPException(status_code=500, detail="База данных недоступна")

    try:
        admins_docs = [normalize_admin_record(item) for item in payload["admins"]]
        universities_docs = [normalize_university_record(item) for item in payload["universities"]]
        programs_docs = [normalize_program_record(item) for item in payload["programs"]]
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Некорректные данные в JSON: {error}")

    university_ids = {item.get("_id") for item in universities_docs}
    orphan_program_ids = [
        str(program_doc.get("university_id"))
        for program_doc in programs_docs
        if program_doc.get("university_id") not in university_ids
    ]
    if orphan_program_ids:
        orphan_values = ", ".join(sorted(set(orphan_program_ids)))
        raise HTTPException(
            status_code=400,
            detail=(
                "Некорректные связи в JSON: найдены направления с university_id, "
                f"которых нет в universities._id ({orphan_values})"
            ),
        )

    preserved_admin = normalize_admin_record(current_admin)
    current_admin_username = preserved_admin.get("username")
    used_admin_ids = {preserved_admin.get("_id")}
    normalized_admins_docs = []

    for admin_doc in admins_docs:
        if admin_doc.get("username") == current_admin_username:
            continue

        admin_id = admin_doc.get("_id")
        if admin_id in used_admin_ids:
            admin_doc["_id"] = ObjectId()
            admin_id = admin_doc["_id"]

        while admin_id in used_admin_ids:
            admin_doc["_id"] = ObjectId()
            admin_id = admin_doc["_id"]

        used_admin_ids.add(admin_id)
        normalized_admins_docs.append(admin_doc)

    normalized_admins_docs.append(preserved_admin)

    try:
        programs_controller._collection.delete_many({})
        universities_controller._collection.delete_many({})
        admins_controller._collection.delete_many({})

        if normalized_admins_docs:
            admins_controller._collection.insert_many(normalized_admins_docs, ordered=True)
        if universities_docs:
            universities_controller._collection.insert_many(universities_docs, ordered=True)
        if programs_docs:
            programs_controller._collection.insert_many(programs_docs, ordered=True)

        return {
            "admins": len(normalized_admins_docs),
            "universities": len(universities_docs),
            "programs": len(programs_docs),
        }
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Не удалось импортировать данные: {error}")


def build_csv_content(rows: list[dict]) -> str:
    if not rows:
        return ""

    fieldnames = sorted({key for row in rows for key in row.keys()})
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()

    for row in rows:
        normalized_row = {}
        for key in fieldnames:
            value = row.get(key)
            if isinstance(value, (dict, list)):
                normalized_row[key] = json.dumps(value, ensure_ascii=False)
            else:
                normalized_row[key] = value
        writer.writerow(normalized_row)

    return output.getvalue()


def append_xml_value(parent: ET.Element, key: str, value):
    if isinstance(value, dict):
        element = ET.SubElement(parent, key)
        for nested_key, nested_value in value.items():
            append_xml_value(element, str(nested_key), nested_value)
        return

    if isinstance(value, list):
        list_element = ET.SubElement(parent, key)
        for item in value:
            item_element = ET.SubElement(list_element, "item")
            if isinstance(item, (dict, list)):
                append_xml_value(item_element, "value", item)
            else:
                item_element.text = "" if item is None else str(item)
        return

    element = ET.SubElement(parent, key)
    element.text = "" if value is None else str(value)


def build_xml_content(admins: list, universities: list, programs: list) -> str:
    root = ET.Element("snapshot")

    meta = ET.SubElement(root, "meta")
    ET.SubElement(meta, "exported_at").text = datetime.now().isoformat()
    ET.SubElement(meta, "version").text = "1.0"
    ET.SubElement(meta, "format").text = "xml"

    sections = (
        ("admins", admins),
        ("universities", universities),
        ("programs", programs),
    )

    for section_name, rows in sections:
        section = ET.SubElement(root, section_name)
        for row in rows:
            item = ET.SubElement(section, "item")
            for key, value in row.items():
                append_xml_value(item, str(key), value)

    xml_bytes = ET.tostring(root, encoding="utf-8")
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + xml_bytes.decode("utf-8")


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

    admins, universities, programs = get_all_collections_data(db)

    payload = {
        "meta": {
            "exported_at": datetime.now().isoformat(),
            "version": "1.0",
            "format": "json",
        },
        "admins": admins,
        "universities": universities,
        "programs": programs,
    }

    filename = f"nsql-export-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"

    return Response(
        content=json.dumps(payload, ensure_ascii=False, indent=2),
        media_type="application/json",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )


@router.get("/export/csv")
async def export_all_data_csv(
    admin: dict = Depends(get_current_admin),
    db: UniversitiesDataBase = Depends(get_db_connection),
):
    del admin

    admins, universities, programs = get_all_collections_data(db)

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as zip_file:
        zip_file.writestr("admins.csv", build_csv_content(admins))
        zip_file.writestr("universities.csv", build_csv_content(universities))
        zip_file.writestr("programs.csv", build_csv_content(programs))

        zip_file.writestr(
            "meta.json",
            json.dumps(
                {
                    "exported_at": datetime.now().isoformat(),
                    "version": "1.0",
                    "format": "csv",
                    "files": ["admins.csv", "universities.csv", "programs.csv"],
                },
                ensure_ascii=False,
                indent=2,
            ),
        )

    zip_buffer.seek(0)
    filename = f"nsql-export-{datetime.now().strftime('%Y%m%d-%H%M%S')}.zip"

    return Response(
        content=zip_buffer.getvalue(),
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )


@router.get("/export/xml")
async def export_all_data_xml(
    admin: dict = Depends(get_current_admin),
    db: UniversitiesDataBase = Depends(get_db_connection),
):
    del admin

    admins, universities, programs = get_all_collections_data(db)
    xml_content = build_xml_content(admins, universities, programs)

    filename = f"nsql-export-{datetime.now().strftime('%Y%m%d-%H%M%S')}.xml"
    return Response(
        content=xml_content,
        media_type="application/xml",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )


@router.post("/import/json")
async def import_all_data_json(
    file: UploadFile = File(...),
    admin: dict = Depends(get_current_admin),
    db: UniversitiesDataBase = Depends(get_db_connection),
):
    if file.content_type not in ("application/json", "text/json", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Поддерживается только JSON-файл")

    try:
        raw_bytes = await file.read()
        payload = json.loads(raw_bytes.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Не удалось прочитать JSON-файл")

    imported_counts = import_snapshot_json(db, payload, admin)
    return {
        "message": "Импорт успешно завершен",
        "imported": imported_counts,
    }
