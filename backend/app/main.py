from fastapi import FastAPI
from app.api import api_router

app = FastAPI(title="Universities API", version="1.0.0")

app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "Universities API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)