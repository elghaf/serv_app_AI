from fastapi import Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from typing import Optional
import os
from dotenv import load_dotenv
import requests
import logging
import jwt
from jwt import PyJWKClient

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

CLERK_SECRET_KEY = os.getenv('CLERK_SECRET_KEY', 'sk_test_iNAoYJBMRBwqFccOEofZgobWLSpVwxpeIqIV7gLyl9')
CLERK_JWKS_URL = "https://liberal-clam-30.clerk.accounts.dev/.well-known/jwks.json"

# Initialize the PyJWKClient
jwks_client = PyJWKClient(CLERK_JWKS_URL)

async def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> dict:
    if not authorization:
        logger.error("No authorization header provided")
        raise HTTPException(status_code=401, detail="No authorization header")

    try:
        # Extract token from Bearer header
        token = authorization.replace("Bearer ", "")
        logger.info(f"Processing token: {token[:10]}...")

        try:
            # Get the signing key
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            
            # Verify and decode the token with minimal requirements
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                options={
                    "verify_aud": False,  # Don't verify audience
                    "verify_exp": True,   # Do verify expiration
                    "verify_iss": True,   # Do verify issuer
                },
                issuer="https://liberal-clam-30.clerk.accounts.dev"
            )

            # Extract user information from the token
            user_data = {
                "user_id": payload.get("sub"),
                "session_id": payload.get("sid"),
                "issued_at": payload.get("iat"),
                "expires_at": payload.get("exp")
            }

            logger.info(f"Successfully verified token for user: {user_data['user_id']}")
            return user_data

        except jwt.InvalidTokenError as e:
            logger.error(f"Token validation failed: {str(e)}")
            raise HTTPException(status_code=401, detail="Invalid token")

    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(status_code=401, detail=str(e))







