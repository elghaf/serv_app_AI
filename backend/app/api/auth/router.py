from fastapi import APIRouter, Depends, HTTPException
from app.utils.auth import get_current_user
from sqlalchemy.orm import Session
from app.db.database import get_db

router = APIRouter()

@router.get("/auth/status")
async def check_auth_status(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user:
        return {"authenticated": True}
    return {"authenticated": False}