from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.utils.password import verify_password
from app.api.login.schema import LoginRequest, LoginResponse
from app.db.models.user import User
from app.db.models.session import Session as SessionModel
from datetime import datetime, timedelta
import uuid
import pytz

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(user.password, request.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Delete any existing sessions for this user
    db.query(SessionModel).filter(SessionModel.user_id == user.id).delete()
    
    # Create new session
    session_id = str(uuid.uuid4())
    expires_at = datetime.now(pytz.UTC) + timedelta(days=7)
    
    session = SessionModel(
        id=session_id,
        user_id=user.id,
        data={"user_email": user.email},
        expires_at=expires_at
    )
    
    db.add(session)
    db.commit()
    
    return LoginResponse(
        access_token=session_id,
        token_type="bearer",
        user_id=user.id,
        email=user.email
    )
