import os

from app.database.dependencies import get_db
from app.database.validation_schemas import validation_admins_schema, validation_programs_schema, \
    validation_universities_schema
from app.api.routes.utils import get_hash_by_username_password


def should_seed_database(db) -> bool:
    admins_controller = db.get_admins_collection()
    universities_controller = db.get_universities_collection()
    programs_controller = db.get_programs_collection()

    if not admins_controller or not universities_controller or not programs_controller:
        print("Could not check db state for seeding")
        return False

    admins_count = admins_controller._collection.count_documents({})
    universities_count = universities_controller._collection.count_documents({})
    programs_count = programs_controller._collection.count_documents({})

    is_empty = admins_count == 0 and universities_count == 0 and programs_count == 0
    if not is_empty:
        print(
            "Database is not empty, skip seed "
            f"(admins={admins_count}, universities={universities_count}, programs={programs_count})"
        )
    return is_empty


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
            "address": "Ленинские горы, д. 1",
            "has_dormitory": True,
            "military_dept": True,
            "website": "https://www.msu.ru",
            "foundation_year": 1755,
            "students_count": 40_000,
            "faculties_count": 15,
            "phone": "+7 (495) 939-10-00",
            "email": "priem@msu.ru",
            "rating": 4.9,
            "programs_count": 3
        },
        {
            "name": "МФТИ (Физтех)",
            "city": "Долгопрудный",
            "address": "Институтский пер., д. 9",
            "has_dormitory": True,
            "military_dept": True,
            "website": "https://www.mipt.ru",
            "foundation_year": 1234,
            "students_count": 30_000,
            "faculties_count": 15,
            "phone": "+7 (495) 100-20-30",
            "email": "priem@mfti.ru",
            "rating": 4.8,
            "programs_count": 3
        },
        {
            "name": "НИУ ВШЭ",
            "city": "Москва",
            "address": "ул. Мясницкая, д. 20",
            "has_dormitory": True,
            "military_dept": False,
            "website": "https://www.hse.ru",
            "foundation_year": 1534,
            "students_count": 35_000,
            "faculties_count": 11,
            "phone": "+7 (495) 111-11-11",
            "email": "priem@vshe.ru",
            "rating": 4.7,
            "programs_count": 3
        },
        {
            "name": "МГТУ им. Баумана",
            "city": "Москва",
            "address": "2-я Бауманская ул., д. 5",
            "has_dormitory": True,
            "military_dept": True,
            "website": "https://www.bmstu.ru",
            "foundation_year": 1234,
            "students_count": 30_000,
            "faculties_count": 15,
            "phone": "+7 (495) 100-20-30",
            "email": "priem@msu.ru",
            "rating": 4.6,
            "programs_count": 3
        },
        {
            "name": "СПбГУ",
            "city": "Санкт-Петербург",
            "address": "Университетская наб., д. 7-9",
            "has_dormitory": True,
            "military_dept": False,
            "website": "https://spbu.ru",
            "foundation_year": 1678,
            "students_count": 20_000,
            "faculties_count": 22,
            "phone": "+7 (812) 222-22-22",
            "email": "priem@spbgu.ru",
            "rating": 4.7,
            "programs_count": 3
        },
        {
            "name": "НГУ",
            "city": "Новосибирск",
            "address": "ул. Пирогова, д. 1",
            "has_dormitory": True,
            "military_dept": False,
            "website": "https://www.nsu.ru",
            "foundation_year": 999,
            "students_count": 10_000,
            "faculties_count": 9,
            "phone": "+7 (495) 500-20-30",
            "email": "priem@ngu.ru",
            "rating": 4.5,
            "programs_count": 3
        },
        {
            "name": "УрФУ",
            "city": "Екатеринбург",
            "address": "ул. Мира, д. 19",
            "has_dormitory": True,
            "military_dept": True,
            "website": "https://urfu.ru",
            "foundation_year": 1920,
            "students_count": 35_000,
            "faculties_count": 14,
            "phone": "+7 (343) 375-44-44",
            "email": "priem@urfu.ru",
            "rating": 4.6,
            "programs_count": 3
        }
    ]

    count = 0
    updated_count = 0
    for uni in default_universities:
        existing_university = universities_controller.find_university_by_name(uni["name"])
        if existing_university:
            current_address = existing_university.get("address")
            if current_address is None or str(current_address).strip() == "":
                success = universities_controller.update_university(
                    id_str=str(existing_university["_id"]),
                    address=uni["address"]
                )
                if success:
                    updated_count += 1
                    print(f"University '{uni['name']}' updated with address")
                else:
                    print(f"Failed to update address for university '{uni['name']}'")
            else:
                print(f"University '{uni['name']}' already has address, skipping")
            continue

        result = universities_controller.add_university(
            name=uni["name"],
            city=uni["city"],
            address=uni["address"],
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

    if updated_count > 0:
        print(f"Total {updated_count} universities updated with address")

def seed_default_programs(db):
    programs_controller = db.get_programs_collection()
    universities_controller = db.get_universities_collection()
    if not programs_controller:
        print("No programs collection available for seeding")
        return

    if not universities_controller:
        print("No universities collection available for program seeding")
        return

    university_names = [
        "МГУ им. Ломоносова",
        "МФТИ (Физтех)",
        "НИУ ВШЭ",
        "МГТУ им. Баумана",
        "СПбГУ",
        "НГУ",
        "УрФУ",
    ]

    university_ids = {}
    for university_name in university_names:
        university = universities_controller.find_university_by_name(university_name)
        if not university:
            print(f"University '{university_name}' not found, related programs will be skipped")
            continue
        university_ids[university_name] = str(university["_id"])

    default_programs = [
        {
            "university_name": "МГУ им. Ломоносова",
            "code": "01.03.02",
            "name": "Прикладная математика и информатика",
            "budget_places": 90,
            "paid_places": 30,
            "passing_score": 292,
            "form_of_education": "Очная",
            "required_subjects": {
                "Математика": 75,
                "Информатика": 80,
                "Русский язык": 75
            }
        },
        {
            "university_name": "МГУ им. Ломоносова",
            "code": "38.03.01",
            "name": "Экономика",
            "budget_places": 60,
            "paid_places": 50,
            "passing_score": 286,
            "form_of_education": "Очная",
            "required_subjects": {
                "Математика": 70,
                "Обществознание": 75,
                "Русский язык": 70
            }
        },
        {
            "university_name": "МГУ им. Ломоносова",
            "code": "42.03.02",
            "name": "Журналистика",
            "budget_places": 45,
            "paid_places": 35,
            "passing_score": 280,
            "form_of_education": "Очная",
            "required_subjects": {
                "Литература": 75,
                "Русский язык": 80,
                "История": 65
            }
        },
        {
            "university_name": "МФТИ (Физтех)",
            "code": "03.03.01",
            "name": "Прикладная математика и физика",
            "budget_places": 110,
            "paid_places": 25,
            "passing_score": 298,
            "form_of_education": "Очная",
            "required_subjects": {
                "Математика": 80,
                "Физика": 78,
                "Русский язык": 70
            }
        },
        {
            "university_name": "МФТИ (Физтех)",
            "code": "09.03.04",
            "name": "Программная инженерия",
            "budget_places": 80,
            "paid_places": 40,
            "passing_score": 294,
            "form_of_education": "Очная",
            "required_subjects": {
                "Математика": 78,
                "Информатика": 80,
                "Русский язык": 70
            }
        },
        {
            "university_name": "МФТИ (Физтех)",
            "code": "11.03.02",
            "name": "Инфокоммуникационные технологии и системы связи",
            "budget_places": 70,
            "paid_places": 20,
            "passing_score": 285,
            "form_of_education": "Очная",
            "required_subjects": {
                "Математика": 72,
                "Физика": 72,
                "Русский язык": 68
            }
        },
        {
            "university_name": "НИУ ВШЭ",
            "code": "38.03.01",
            "name": "Экономика",
            "budget_places": 95,
            "paid_places": 85,
            "passing_score": 289,
            "form_of_education": "Очная",
            "required_subjects": {
                "Математика": 72,
                "Обществознание": 75,
                "Русский язык": 70
            }
        },
        {
            "university_name": "НИУ ВШЭ",
            "code": "09.03.03",
            "name": "Прикладная информатика",
            "budget_places": 60,
            "paid_places": 70,
            "passing_score": 283,
            "form_of_education": "Очная",
            "required_subjects": {
                "Математика": 70,
                "Информатика": 75,
                "Русский язык": 68
            }
        },
        {
            "university_name": "НИУ ВШЭ",
            "code": "40.03.01",
            "name": "Юриспруденция",
            "budget_places": 50,
            "paid_places": 90,
            "passing_score": 276,
            "form_of_education": "Очная",
            "required_subjects": {
                "Обществознание": 75,
                "История": 70,
                "Русский язык": 72
            }
        },
        {
            "university_name": "МГТУ им. Баумана",
            "code": "09.03.01",
            "name": "Информатика и вычислительная техника",
            "budget_places": 120,
            "paid_places": 35,
            "passing_score": 284,
            "form_of_education": "Очная",
            "required_subjects": {
                "Математика": 74,
                "Информатика": 72,
                "Русский язык": 68
            }
        },
        {
            "university_name": "МГТУ им. Баумана",
            "code": "15.03.04",
            "name": "Автоматизация технологических процессов и производств",
            "budget_places": 85,
            "paid_places": 25,
            "passing_score": 275,
            "form_of_education": "Очная",
            "required_subjects": {
                "Математика": 70,
                "Физика": 70,
                "Русский язык": 66
            }
        },
        {
            "university_name": "МГТУ им. Баумана",
            "code": "24.03.01",
            "name": "Ракетные комплексы и космонавтика",
            "budget_places": 75,
            "paid_places": 20,
            "passing_score": 282,
            "form_of_education": "Очная",
            "required_subjects": {
                "Математика": 72,
                "Физика": 74,
                "Русский язык": 67
            }
        },
        {
            "university_name": "СПбГУ",
            "code": "01.03.02",
            "name": "Прикладная математика и информатика",
            "budget_places": 70,
            "paid_places": 60,
            "passing_score": 279,
            "form_of_education": "Очная",
            "required_subjects": {
                "Математика": 70,
                "Информатика": 72,
                "Русский язык": 68
            }
        },
        {
            "university_name": "СПбГУ",
            "code": "45.03.02",
            "name": "Лингвистика",
            "budget_places": 65,
            "paid_places": 55,
            "passing_score": 274,
            "form_of_education": "Очная",
            "required_subjects": {
                "Русский язык": 75,
                "Английский язык": 78,
                "История": 62
            }
        },
        {
            "university_name": "СПбГУ",
            "code": "04.03.01",
            "name": "Химия",
            "budget_places": 55,
            "paid_places": 30,
            "passing_score": 270,
            "form_of_education": "Очная",
            "required_subjects": {
                "Химия": 72,
                "Математика": 65,
                "Русский язык": 66
            }
        },
        {
            "university_name": "НГУ",
            "code": "01.03.01",
            "name": "Математика",
            "budget_places": 80,
            "paid_places": 25,
            "passing_score": 276,
            "form_of_education": "Очная",
            "required_subjects": {
                "Математика": 74,
                "Информатика": 68,
                "Русский язык": 66
            }
        },
        {
            "university_name": "НГУ",
            "code": "06.03.01",
            "name": "Биология",
            "budget_places": 70,
            "paid_places": 35,
            "passing_score": 265,
            "form_of_education": "Очная",
            "required_subjects": {
                "Биология": 72,
                "Химия": 70,
                "Русский язык": 65
            }
        },
        {
            "university_name": "НГУ",
            "code": "09.03.04",
            "name": "Программная инженерия",
            "budget_places": 75,
            "paid_places": 45,
            "passing_score": 278,
            "form_of_education": "Очная",
            "required_subjects": {
                "Математика": 72,
                "Информатика": 73,
                "Русский язык": 66
            }
        },
        {
            "university_name": "УрФУ",
            "code": "09.03.01",
            "name": "Информатика и вычислительная техника",
            "budget_places": 90,
            "paid_places": 45,
            "passing_score": 271,
            "form_of_education": "Очная",
            "required_subjects": {
                "Математика": 70,
                "Информатика": 70,
                "Русский язык": 66
            }
        },
        {
            "university_name": "УрФУ",
            "code": "13.03.02",
            "name": "Электроэнергетика и электротехника",
            "budget_places": 75,
            "paid_places": 30,
            "passing_score": 262,
            "form_of_education": "Очная",
            "required_subjects": {
                "Математика": 68,
                "Физика": 68,
                "Русский язык": 64
            }
        },
        {
            "university_name": "УрФУ",
            "code": "38.03.02",
            "name": "Менеджмент",
            "budget_places": 60,
            "paid_places": 70,
            "passing_score": 258,
            "form_of_education": "Очная",
            "required_subjects": {
                "Математика": 64,
                "Обществознание": 68,
                "Русский язык": 66
            }
        },
    ]

    count = 0
    for prog in default_programs:
        university_id = university_ids.get(prog["university_name"])
        if not university_id:
            print(f"Program '{prog['name']}' skipped: university '{prog['university_name']}' is missing")
            continue

        result = programs_controller.add_program(
            university_id=university_id,
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

    if should_seed_database(db):
        print("Database is empty, starting seed")
        seed_default_admin(db)
        seed_default_universities(db)
        seed_default_programs(db)

    db.close_db()