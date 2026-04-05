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

if __name__ == "__main__":
    db = get_db()
    db.connect_to_db()
    db.create_collections(validation_admins_schema=validation_admins_schema,
                          validation_programs_schema=validation_programs_schema,
                          validation_universities_schema=validation_universities_schema)
    seed_default_admin(db)
    db.close_db()