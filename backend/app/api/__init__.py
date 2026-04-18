from fastapi import APIRouter
from app.api.routes import universities, admins, programs, data_transfer

api_router = APIRouter()
api_router.include_router(universities.router)
api_router.include_router(admins.router)
api_router.include_router(programs.router)
api_router.include_router(data_transfer.router)