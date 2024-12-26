from pydantic import BaseModel
from datetime import date
from typing import Optional

class DiaryEntryBase(BaseModel):
    date: date
    content: str

class DiaryEntryCreate(DiaryEntryBase):
    pass

class DiaryEntry(DiaryEntryBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None