import os

from app.database.dependencies import get_db
from app.database.validation_schemas import validation_admins_schema, validation_programs_schema, \
    validation_universities_schema
from app.api.routes.utils import get_hash_by_username_password


def seed_default_admin(db):
    admins_controller = db.get_admins_collection()
    if not admins_controller:
        print("No admins collection available for seeding")
        return

    seed_username = os.getenv("SEED_ADMIN_USERNAME")
    seed_password = os.getenv("SEED_ADMIN_PASSWORD")

    if not seed_username or not seed_password:
        print("Seed admin credentials are not set, skipping admin seed")
        return

    if admins_controller.find_admin_by_username(seed_username):
        print(f"Admin '{seed_username}' already exists, skipping seed")
        return

    hashed_password = get_hash_by_username_password(seed_username, seed_password)
    result = admins_controller.add_admin(seed_username, hashed_password)

    if result:
        print(f"Seed admin '{seed_username}' created")
    else:
        print(f"Failed to create seed admin '{seed_username}'")


def seed_default_universities(db):
    universities_controller = db.get_universities_collection()
    if not universities_controller:
        print("No universities collection available for seeding")
        return

    default_universities = [
        {
            "name": "МГУ им. Ломоносова",
            "city": "Москва",
            "has_dormitory": True,
            "military_dept": True,
            "website": "https://www.msu.ru",
            "foundation_year": 1755,
            "students_count": 40_000,
            "faculties_count": 15,
            "phone": "+7 (495) 939-10-00",
            "email": "priem@msu.ru",
            "rating": 4.9,
            "programs_count": 128
        },
        {
            "name": "МФТИ (Физтех)",
            "city": "Долгопрудный",
            "has_dormitory": True,
            "military_dept": True,
            "website": "https://www.mipt.ru",
            "foundation_year": 1234,
            "students_count": 30_000,
            "faculties_count": 15,
            "phone": "+7 (495) 100-20-30",
            "email": "priem@mfti.ru",
            "rating": 4.8,
            "programs_count": 85
        },
        {
            "name": "НИУ ВШЭ",
            "city": "Москва",
            "has_dormitory": True,
            "military_dept": False,
            "website": "https://www.hse.ru",
            "foundation_year": 1534,
            "students_count": 35_000,
            "faculties_count": 11,
            "phone": "+7 (495) 111-11-11",
            "email": "priem@vshe.ru",
            "rating": 4.7,
            "programs_count": 156
        },
        {
            "name": "МГТУ им. Баумана",
            "city": "Москва",
            "has_dormitory": True,
            "military_dept": True,
            "website": "https://www.bmstu.ru",
            "foundation_year": 1234,
            "students_count": 30_000,
            "faculties_count": 15,
            "phone": "+7 (495) 100-20-30",
            "email": "priem@msu.ru",
            "rating": 4.6,
            "programs_count": 112
        },
        {
            "name": "СПбГУ",
            "city": "Санкт-Петербург",
            "has_dormitory": True,
            "military_dept": False,
            "website": "https://spbu.ru",
            "foundation_year": 1678,
            "students_count": 20_000,
            "faculties_count": 22,
            "phone": "+7 (812) 222-22-22",
            "email": "priem@spbgu.ru",
            "rating": 4.7,
            "programs_count": 98
        },
        {
            "name": "НГУ",
            "city": "Новосибирск",
            "has_dormitory": True,
            "military_dept": False,
            "website": "https://www.nsu.ru",
            "foundation_year": 999,
            "students_count": 10_000,
            "faculties_count": 9,
            "phone": "+7 (495) 500-20-30",
            "email": "priem@ngu.ru",
            "rating": 4.5,
            "programs_count": 67
        }
    ]

    count = 0
    for uni in default_universities:
        if universities_controller.find_university_by_name(uni["name"]):
            print(f"University '{uni['name']}' already exists, skipping")
            continue

        result = universities_controller.add_university(
            name=uni["name"],
            city=uni["city"],
            has_dormitory=uni["has_dormitory"],
            military_dept=uni["military_dept"],
            website=uni["website"],
            foundation_year=uni["foundation_year"],
            students_count=uni["students_count"],
            faculties_count=uni["faculties_count"],
            phone=uni["phone"],
            email=uni["email"],
            rating=uni["rating"],
            programs_count=uni["programs_count"]
        )

        if result:
            print(f"University '{uni['name']}' created with ID: {result}")
            count += 1
        else:
            print(f"Failed to create university '{uni['name']}'")

    if count > 0:
        print(f"Total {count} universities seeded")
    else:
        print("No new universities were added")

def seed_default_programs(db):
    programs_controller = db.get_programs_collection()
    universities_controller = db.get_universities_collection()
    if not programs_controller:
        print("No programs collection available for seeding")
        return

    default_programs = [
        {
            "university_id": str(universities_controller.find_university_by_name("мфти (физтех)")["_id"]),
            "code": "01.03.02",
            "name": "Прикладная математика и информатика",
            "budget_places": 25,
            "paid_places": 15,
            "passing_score": 290,
            "form_of_education": "Очно",
            "required_subjects": {
                "Математика": 70,
                "Информатика": 75,
                "Русский язык": 80
            }
        },
        {
            "university_id": str(universities_controller.find_university_by_name("СПбГУ")["_id"]),
            "code": "01.03.02",
            "name": "Прикладная математика и информатика",
            "budget_places": 5,
            "paid_places": 65,
            "passing_score": 270,
            "form_of_education": "Очно",
            "required_subjects": {
                "Математика": 60,
                "Информатика": 65,
                "Русский язык": 70
            }
        },
        {
            "university_id": str(universities_controller.find_university_by_name("МФТИ (физтех)")["_id"]),
            "code": "09.03.04",
            "name": "Программная инженерия",
            "budget_places": 15,
            "paid_places": 35,
            "passing_score": 288,
            "form_of_education": "Очно",
            "required_subjects": {
                "Математика": 70,
                "Информатика": 65,
                "Русский язык": 60
            }
        },
        {
            "university_id": str(universities_controller.find_university_by_name("спбгу")["_id"]),
            "code": "03.03.04",
            "name": "Автоматизация тестирования",
            "budget_places": 16,
            "paid_places": 77,
            "passing_score": 110,
            "form_of_education": "Очно",
            "required_subjects": {
                "Математика": 75,
                "Обществознание": 55
            }
        },
    ]

    count = 0
    for prog in default_programs:
        result = programs_controller.add_program(
            university_id=prog["university_id"],
            code=prog["code"],
            name=prog["name"],
            budget_places=prog["budget_places"],
            paid_places=prog["paid_places"],
            passing_score=prog["passing_score"],
            form_of_education=prog["form_of_education"],
            required_subjects=prog["required_subjects"]
        )

        if result:
            print(f"Program '{prog['name']}' created with ID: {result}")
            count += 1
        else:
            print(f"Failed to create program '{prog['name']}'")

    if count > 0:
        print(f"Total {count} programs seeded")
    else:
        print("No new programs were added")

if __name__ == "__main__":
    db = get_db()
    db.connect_to_db()
    db.create_collections(validation_admins_schema=validation_admins_schema,
                          validation_programs_schema=validation_programs_schema,
                          validation_universities_schema=validation_universities_schema)
    seed_default_admin(db)
    seed_default_universities(db)
    seed_default_programs(db)
    db.close_db()