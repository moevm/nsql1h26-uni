from fastapi import APIRouter
from app.api.routes import universities, admins

api_router = APIRouter()
api_router.include_router(universities.router)
api_router.include_router(admins.router)