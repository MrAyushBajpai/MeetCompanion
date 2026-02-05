from fastapi import FastAPI
from .database import engine, Base
from .routes import extract

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskScribe API")

app.include_router(extract.router)
