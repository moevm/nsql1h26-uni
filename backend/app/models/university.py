import re
from typing import Optional
from pydantic import BaseModel, Field, field_validator


PHONE_PATTERN = re.compile(r"^\+?[0-9()\-\s]{7,20}$")

class UniversityCreate(BaseModel):
    name: str
    city: str
    has_dormitory: bool
    military_dept: bool
    website: str
    foundation_year: Optional[int] = None
    students_count: Optional[int] = None
    faculties_count: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    comment: Optional[str] = None
    rating: Optional[float] = Field(default=None, ge=0, le=5.0)
    programs_count: Optional[int] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value

        normalized = value.strip()
        if normalized == "":
            return None

        if not PHONE_PATTERN.match(normalized):
            raise ValueError("Некорректный формат телефона")

        return normalized

class UniversityUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    has_dormitory: Optional[bool] = None
    military_dept: Optional[bool] = None
    website: Optional[str] = None
    foundation_year: Optional[int] = None
    students_count: Optional[int] = None
    faculties_count: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    comment: Optional[str] = None
    rating: Optional[float] = Field(default=None, ge=0, le=5.0)
    programs_count: Optional[int] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value

        normalized = value.strip()
        if normalized == "":
            return None

        if not PHONE_PATTERN.match(normalized):
            raise ValueError("Некорректный формат телефона")

        return normalized