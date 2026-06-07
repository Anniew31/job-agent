from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv
from src.database.database import get_profile_by_email
from src.models import Profile
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY") or ""
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 24
password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# hash a password
def hash_password(password: str):
    return password_hash.hash(password)

# returns T/F depending on if right hash
def verify_password(password: str, hashed: str):
    return password_hash.verify(password, hashed)

# creates a token for a profile
def create_access_token(email: str, profile_id: int) -> str:
    payload = {
        "sub" : email,
        "profile_id": profile_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes = TOKEN_EXPIRE_MINUTES)
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# decodes token and returns payload dict
def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

# reads token from header and returns profile dict
def get_current_user(token: str = Depends(oauth2_scheme)) -> Profile:
    payload = decode_token(token)
    email = payload.get("sub")
    profile = get_profile_by_email(email or "")
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return Profile(**profile)


