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
                     "military_dept", "website", "comment", "createdAt", "updatedAt"],
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
        "required": ["university_id", "name", "budget_places", "passing_score",
                     "required_subjects", "createdAt", "updatedAt"],
        "properties": {
            "_id": {
                "bsonType": "objectId"
            },
            "university_id": {
                "bsonType": "objectId"
            },
            "name": {
                "bsonType": "string",
                "maxLength": 255
            },
            "budget_places": {
                "bsonType": "int",
                "minimum": 0
            },
            "passing_score": {
                "bsonType": "int",
                "minimum": 0
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
