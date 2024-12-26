from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    entries = relationship("DiaryEntry", back_populates="owner")

class DiaryEntry(Base):
    __tablename__ = "diary_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    content = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="entries") 