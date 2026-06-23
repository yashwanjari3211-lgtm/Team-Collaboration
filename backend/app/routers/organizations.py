from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.organization import OrgCreate, OrgOut
from app.models.organization import Organization
from app.models.user import User
from app.utils.dependencies import get_current_user

router = APIRouter()

@router.post("/", response_model=OrgOut)
def create_organization(org: OrgCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_org = Organization(name=org.name, description=org.description)
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    return db_org

@router.get("/", response_model=list[OrgOut])
def list_organizations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Organization).all()
