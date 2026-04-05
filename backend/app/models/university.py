from typing import Optional
from pydantic import BaseModel

class UniversityCreate(BaseModel):
    name: str
    city: str
    has_dormitory: bool
    military_dept: bool
    website: str
    comment: Optional[str] = None
    rating: Optional[float] = None
    programs_count: Optional[int] = None

class UniversityUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    has_dormitory: Optional[bool] = None
    military_dept: Optional[bool] = None
    website: Optional[str] = None
    comment: Optional[str] = None
    rating: Optional[float] = None
    programs_count: Optional[int] = None