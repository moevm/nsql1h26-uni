validation_admins_schema = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["username", "password_hash", "createdAt"],
        "properties": {
            "_id": {
                "bsonType": "objectId"
            },
            "username": {
                "bsonType": "string"
            },
            "password_hash": {
                "bsonType": "string",
                "maxLength": 60
            },
            "createdAt": {
                "bsonType": "date"
            }
        }
    }
}

validation_universities_schema = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["name", "city", "has_dormitory",
                     "military_dept", "website", "foundation_year", "students_count",
                     "faculties_count", "phone", "email", "comment", "rating", "programs_count",
                     "createdAt", "updatedAt"],
        "properties": {
            "_id": {
                "bsonType": "objectId",
            },
            "name": {
                "bsonType": "string",
                "maxLength": 255,
            },
            "city": {
                "bsonType": "string",
                "maxLength": 100,
            },
            "address": {
                "bsonType": "string",
                "maxLength": 255
            },
            "has_dormitory": {
                "bsonType": "bool"
            },
            "military_dept": {
                "bsonType": "bool"
            },
            "website": {
                "bsonType": "string",
                "maxLength": 255
            },
            "foundation_year": {
                "bsonType": "int",
                "minimum": 0
            },
            "students_count": {
                "bsonType": "int",
                "minimum": 0
            },
            "faculties_count": {
                "bsonType": "int",
                "minimum": 0
            },
            "phone": {
                "bsonType": "string",
                "maxLength": 30,
                "pattern": "^$|^(?=(?:\\D*\\d){7,15}\\D*$)\\+?[0-9()\\-\\s]{7,20}$"
            },
            "email": {
                "bsonType": "string",
                "maxLength": 100
            },
            "rating": {
                "bsonType": "double",
                "minimum": 0,
                "maximum": 5
            },
            "programs_count": {
                "bsonType": "int",
                "minimum": 0
            },
            "comment": {
                "bsonType": "string",
                "maxLength": 1024
            },
            "createdAt": {
                "bsonType": "date"
            },
            "updatedAt": {
                "bsonType": "date"
            }
        }
    }
}


validation_programs_schema = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["university_id", "code", "name", "budget_places", "paid_places", "passing_score",
                     "form_of_education", "required_subjects", "comment", "createdAt", "updatedAt"],
        "properties": {
            "_id": {
                "bsonType": "objectId"
            },
            "university_id": {
                "bsonType": "objectId"
            },
            "code": {
                "bsonType": "string",
                "maxLength": 255
            },
            "name": {
                "bsonType": "string",
                "maxLength": 255
            },
            "budget_places": {
                "bsonType": "int",
                "minimum": 0
            },
            "paid_places": {
                "bsonType": "int",
                "minimum": 0
            },
            "passing_score": {
                "bsonType": "int",
                "minimum": 0
            },
            "form_of_education": {
                "bsonType": "string",
                "maxLength": 20
            },
            "required_subjects": {
                "bsonType": "array",
                "minItems": 1,
                "items": {
                    "bsonType": "object",
                    "required": ["subject", "minimum_points"],
                    "properties": {
                        "subject": {
                            "bsonType": "string",
                            "maxLength": 50
                        },
                        "minimum_points": {
                            "bsonType": "int",
                            "minimum": 0,
                            "maximum": 100
                        }
                    }
                }
            },
            "comment": {
                "bsonType": "string",
                "maxLength": 1024
            },
            "createdAt": {
                "bsonType": "date"
            },
            "updatedAt": {
                "bsonType": "date"
            }
        }
    }
}
