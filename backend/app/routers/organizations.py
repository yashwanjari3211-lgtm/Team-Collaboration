from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.organization import OrgCreate, OrgOut
from app.models.organization import Organization, OrganizationMember
from app.models.user import User
from app.utils.dependencies import get_current_user, get_current_organization
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

@router.get("/members")
def list_organization_members(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_organization),
):
    """List all members of the current organization with their user info."""
    members = (
        db.query(User.id, User.email, User.full_name, User.avatar, OrganizationMember.role)
        .join(OrganizationMember, OrganizationMember.user_id == User.id)
        .filter(OrganizationMember.organization_id == org.id)
        .all()
    )
    seen_users = set()
    unique_members = []
    for m in members:
        if m.id not in seen_users:
            seen_users.add(m.id)
            unique_members.append({
                "id": m.id,
                "email": m.email,
                "full_name": m.full_name,
                "avatar": m.avatar,
                "role": m.role,
            })
    return unique_members
