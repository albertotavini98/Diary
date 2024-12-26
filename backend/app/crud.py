from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, date
from typing import Optional

from . import models, schemas, auth

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# User operations
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        return False
    if not auth.verify_password(password, user.hashed_password):
        return False
    return user

async def get_current_user(db: Session, token: str):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

# Diary entry operations
def create_diary_entry(db: Session, entry: schemas.DiaryEntryCreate, user_id: int):
    # Check if an entry already exists for this date and user
    existing_entry = db.query(models.DiaryEntry).filter(
        models.DiaryEntry.user_id == user_id,
        models.DiaryEntry.date == entry.date
    ).first()
    
    if existing_entry:
        # Update existing entry
        existing_entry.content = entry.content
        db.commit()
        db.refresh(existing_entry)
        return existing_entry
    else:
        # Create new entry
        db_entry = models.DiaryEntry(**entry.dict(), user_id=user_id)
        db.add(db_entry)
        db.commit()
        db.refresh(db_entry)
        return db_entry

def get_entry_by_date(db: Session, user_id: int, entry_date: date):
    # Get the most recent entry for the given date
    return db.query(models.DiaryEntry).filter(
        models.DiaryEntry.user_id == user_id,
        models.DiaryEntry.date == entry_date
    ).first()

def get_user_entries(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    # Get unique entries by date (most recent version)
    return db.query(models.DiaryEntry)\
        .filter(models.DiaryEntry.user_id == user_id)\
        .order_by(models.DiaryEntry.date.desc())\
        .distinct(models.DiaryEntry.date)\
        .offset(skip)\
        .limit(limit)\
        .all()

def update_entry(
    db: Session,
    entry_id: int,
    user_id: int,
    content: str
):
    db_entry = db.query(models.DiaryEntry).filter(
        models.DiaryEntry.id == entry_id,
        models.DiaryEntry.user_id == user_id
    ).first()
    
    if not db_entry:
        return None
    
    db_entry.content = content
    db.commit()
    db.refresh(db_entry)
    return db_entry

def delete_entry(db: Session, entry_id: int, user_id: int):
    db_entry = db.query(models.DiaryEntry).filter(
        models.DiaryEntry.id == entry_id,
        models.DiaryEntry.user_id == user_id
    ).first()
    
    if not db_entry:
        return False
    
    db.delete(db_entry)
    db.commit()
    return True 

def delete_entry_by_date(db: Session, user_id: int, entry_date: date):
    entry = db.query(models.DiaryEntry).filter(
        models.DiaryEntry.user_id == user_id,
        models.DiaryEntry.date == entry_date
    ).first()
    
    if entry:
        db.delete(entry)
        db.commit()
        return True
    return False 