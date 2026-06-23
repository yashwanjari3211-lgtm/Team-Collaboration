from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserOut
from app.models.user import User
from app.utils.dependencies import get_current_user

router = APIRouter()

@router.get("/me", response_model=UserOut)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserOut)
def update_profile(full_name: str | None = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if full_name:
        current_user.full_name = full_name
    db.commit()
    db.refresh(current_user)
    return current_user
