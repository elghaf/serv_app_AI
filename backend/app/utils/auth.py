from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models.session import Session as SessionModel
from datetime import datetime
import pytz

async def get_current_user(
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    try:
        scheme, token = authorization.split()
        if scheme.lower() != 'bearer':
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        
        session = db.query(SessionModel).filter(SessionModel.id == token).first()
        if not session:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        # Check if session has expired
        if session.expires_at < datetime.now(pytz.UTC):
            db.delete(session)
            db.commit()
            raise HTTPException(status_code=401, detail="Session expired")
            
        # Update last accessed time
        session.last_accessed_at = datetime.now(pytz.UTC)
        db.commit()
        
        return session
        
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")