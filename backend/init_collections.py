from app.database.dependencies import get_db
from app.database.validation_schemas import validation_admins_schema, validation_programs_schema, \
    validation_universities_schema

if __name__ == "__main__":
    db = get_db()
    db.connect_to_db()
    db.create_collections(validation_admins_schema=validation_admins_schema,
                          validation_programs_schema=validation_programs_schema,
                          validation_universities_schema=validation_universities_schema)
    db.close_db()