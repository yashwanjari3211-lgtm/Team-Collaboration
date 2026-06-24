from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.organization import OrgCreate, OrgOut
from app.models.organization import Organization, OrganizationMember
from app.models.user import User
from app.utils.dependencies import get_current_user
import uuid
import re

def generate_slug(name):
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    return f"{slug}-{uuid.uuid4().hex[:6]}"

router = APIRouter()

@router.post("/", response_model=OrgOut)
def create_organization(org: OrgCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    slug = generate_slug(org.name)
    db_org = Organization(name=org.name, description=org.description, slug=slug)
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    
    member = OrganizationMember(organization_id=db_org.id, user_id=current_user.id, role="owner")
    db.add(member)
    db.commit()
    
    return db_org

@router.get("/", response_model=list[OrgOut])
def list_organizations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Organization).join(OrganizationMember).filter(OrganizationMember.user_id == current_user.id).all()
