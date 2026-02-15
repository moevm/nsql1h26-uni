from fastapi import FastAPI
from dotenv import load_dotenv
from .db.dependencies import get_db
from .api.admin_routes import router

load_dotenv()

app = FastAPI()
app.include_router(router)

db = get_db()

@app.on_event("startup")
async def startup_event():
    db.connect_to_db()

@app.on_event("shutdown")
async def shutdown_event():
    db.close_db()