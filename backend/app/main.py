from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from . import models, schemas, crud, auth
from .database import engine, SessionLocal

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user_from_token(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    return await crud.get_current_user(db, token)

@app.post("/signup", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/entries/", response_model=schemas.DiaryEntry)
async def create_entry(
    entry: schemas.DiaryEntryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_token)
):
    return crud.create_diary_entry(db=db, entry=entry, user_id=current_user.id)

@app.get("/entries/", response_model=List[schemas.DiaryEntry])
async def read_entries(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_token)
):
    entries = crud.get_user_entries(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return entries

@app.get("/entries/{date}", response_model=schemas.DiaryEntry)
async def read_entry_by_date(
    date: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_token)
):
    entry = crud.get_entry_by_date(db, user_id=current_user.id, date=date)
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry

@app.delete("/entries/{date}")
async def delete_entry(
    date: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_token)
):
    entry_date = datetime.strptime(date, "%Y-%m-%d").date()
    success = crud.delete_entry_by_date(db, current_user.id, entry_date)
    if not success:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Entry deleted successfully"}