from typing import Optional
from pydantic import BaseModel


class ProgramCreate(BaseModel):
    university_id: str
    code: str
    name: str
    budget_places: int
    paid_places: int
    passing_score: int
    form_of_education: str
    required_subjects: dict[str, int]
    comment: Optional[str] = None


class ProgramUpdate(BaseModel):
    university_id: Optional[str] = None
    code: Optional[str] = None
    name: Optional[str] = None
    budget_places: Optional[int] = None
    paid_places: Optional[int] = None
    passing_score: Optional[int] = None
    form_of_education: Optional[str] = None
    required_subjects: Optional[dict[str, int]] = None
    comment: Optional[str] = None
