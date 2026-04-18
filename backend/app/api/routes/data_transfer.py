import json
import csv
import io
import zipfile
from datetime import datetime
from xml.etree import ElementTree as ET

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


def get_all_collections_data(db: UniversitiesDataBase) -> tuple[list, list, list]:
    admins_controller = db.get_admins_collection()
    universities_controller = db.get_universities_collection()
    programs_controller = db.get_programs_collection()

    if not admins_controller or not universities_controller or not programs_controller:
        raise HTTPException(status_code=500, detail="База данных недоступна")

    admins = serialize_mongo_value(admins_controller.find_all_admins())
    universities = serialize_mongo_value(universities_controller.find_universities_by_filters())
    programs = serialize_mongo_value(programs_controller.find_programs_by_filters())
    return admins, universities, programs


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
