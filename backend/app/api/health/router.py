from fastapi import APIRouter, Depends
from app.utils.auth import get_current_user

router = APIRouter()

@router.get("/health")
async def health_check(current_user: int = Depends(get_current_user)):
    return {"status": "healthy"}