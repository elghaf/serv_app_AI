from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models.session import Session as SessionModel
from datetime import datetime
import pytz
import logging

logger = logging.getLogger(__name__)

async def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    logger.info("Starting authentication check")
    
    if not authorization:
        logger.error("No authorization header found")
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing"
        )

    try:
        logger.info(f"Authorization header received: {authorization[:20]}...")
        scheme, token = authorization.split()
        
        if scheme.lower() != 'bearer':
            logger.error(f"Invalid auth scheme: {scheme}")
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication scheme"
            )
        
        if not token:
            logger.error("Token is empty")
            raise HTTPException(
                status_code=401,
                detail="Token is missing"
            )
        
        logger.info(f"Looking up session with token: {token[:8]}...")
        session = db.query(SessionModel).filter(SessionModel.id == token).first()
        
        if not session:
            logger.error(f"No session found for token: {token[:8]}...")
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token"
            )
            
        # Check if session has expired
        current_time = datetime.now(pytz.UTC)
        if session.expires_at < current_time:
            logger.error(f"Session expired at {session.expires_at}, current time: {current_time}")
            db.delete(session)
            db.commit()
            raise HTTPException(
                status_code=401,
                detail="Session expired"
            )
            
        logger.info(f"Authentication successful for user_id: {session.user_id}")
        # Update last accessed time
        session.last_accessed_at = current_time
        db.commit()
        
        return session.user_id
        
    except ValueError as e:
        logger.error(f"ValueError in auth: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail="Invalid token format"
        )
    except Exception as e:
        logger.error(f"Unexpected error in auth: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )
