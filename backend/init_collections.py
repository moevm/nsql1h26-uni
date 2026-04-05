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
            "rating": 4.9,
            "programs_count": 128
        },
        {
            "name": "МФТИ (Физтех)",
            "city": "Долгопрудный",
            "has_dormitory": True,
            "military_dept": True,
            "website": "https://www.mipt.ru",
            "rating": 4.8,
            "programs_count": 85
        },
        {
            "name": "НИУ ВШЭ",
            "city": "Москва",
            "has_dormitory": True,
            "military_dept": False,
            "website": "https://www.hse.ru",
            "rating": 4.7,
            "programs_count": 156
        },
        {
            "name": "МГТУ им. Баумана",
            "city": "Москва",
            "has_dormitory": True,
            "military_dept": True,
            "website": "https://www.bmstu.ru",
            "rating": 4.6,
            "programs_count": 112
        },
        {
            "name": "СПбГУ",
            "city": "Санкт-Петербург",
            "has_dormitory": True,
            "military_dept": False,
            "website": "https://spbu.ru",
            "rating": 4.7,
            "programs_count": 98
        },
        {
            "name": "НГУ",
            "city": "Новосибирск",
            "has_dormitory": True,
            "military_dept": False,
            "website": "https://www.nsu.ru",
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

if __name__ == "__main__":
    db = get_db()
    db.connect_to_db()
    db.create_collections(validation_admins_schema=validation_admins_schema,
                          validation_programs_schema=validation_programs_schema,
                          validation_universities_schema=validation_universities_schema)
    seed_default_admin(db)
    seed_default_universities(db)
    db.close_db()