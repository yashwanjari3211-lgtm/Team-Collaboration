import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.invite import Invite
from app.models.organization import Organization, OrganizationMember
from app.models.user import User
from app.schemas.invite import InviteCreate, InviteOut, InviteAccept
from app.utils.dependencies import get_current_user, get_current_organization, RoleChecker

router = APIRouter()

@router.post("/", response_model=InviteOut)
def create_invite(
    invite_data: InviteCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user), 
    org: Organization = Depends(get_current_organization),
    role = Depends(RoleChecker(['admin', 'owner']))
):
    token = uuid.uuid4().hex
    invite = Invite(
        email=invite_data.email,
        organization_id=org.id,
        token=token,
        role=invite_data.role
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)
    
    # Mock sending email
    print(f"\n--- MOCK EMAIL ---")
    print(f"To: {invite.email}")
    print(f"Subject: You've been invited to {org.name}")
    print(f"Link: http://localhost:5173/accept-invite?token={token}")
    print(f"------------------\n")
    
    return invite

@router.get("/", response_model=list[InviteOut])
def list_invites(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user), 
    org: Organization = Depends(get_current_organization),
    role = Depends(RoleChecker(['admin', 'owner']))
):
    return db.query(Invite).filter(Invite.organization_id == org.id).all()

@router.post("/accept")
def accept_invite(
    accept_data: InviteAccept,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invite = db.query(Invite).filter(Invite.token == accept_data.token, Invite.status == 'pending').first()
    if not invite:
        raise HTTPException(status_code=400, detail="Invalid or expired invite")
        
    # Check if already member
    existing = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == invite.organization_id,
        OrganizationMember.user_id == current_user.id
    ).first()
    
    if not existing:
        member = OrganizationMember(
            organization_id=invite.organization_id,
            user_id=current_user.id,
            role=invite.role
        )
        db.add(member)
        
    invite.status = 'accepted'
    db.commit()
    
    return {"message": "Invite accepted", "organization_id": invite.organization_id}
