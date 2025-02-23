import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Create logger
logger = logging.getLogger(__name__)

from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import importlib
import pkgutil
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import user as user_model
from app.schemas import user as user_schema
from app.utils.auth import get_current_user  # Only import what's in auth.py
from app.utils.password import hash_password, verify_password  # Correct function name is hash_password
from app.utils.jwt import create_access_token  # Import from jwt.py
from datetime import timedelta
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.api.create_user.router import router as create_user_router
from app.api.get_test.router import router as get_test_router

from app.db.database import engine, Base
from app.db.models import (
    user as user_model,
    session as session_model,
    detection_log as detection_log_model,
)

from fastapi.staticfiles import StaticFiles


def init_db():
    Base.metadata.create_all(bind=engine)


from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


api_dir = Path(__file__).parent / "api"

# auto import router
for api in api_dir.iterdir():
    if api.is_dir():  # folder(each endpoint)
        router_module = f"app.api.{api.name}.router"
        try:
            module = importlib.import_module(router_module)
            if hasattr(module, "router"):
                app.include_router(module.router)
                print(f"✅ router added: {router_module}")  # debug
        except ModuleNotFoundError:
            if api.name == "__pycache__" or api.name == "__init__":
                continue
            print(f"⚠️ {router_module} not found (router.py is missing)")


# serve log folder as static files
log_directory = os.path.join(os.path.dirname(__file__), "log")

# log the output of the server
if not os.path.exists(log_directory):
    os.makedirs(log_directory)

app.mount("/log", StaticFiles(directory=log_directory), name="log")
