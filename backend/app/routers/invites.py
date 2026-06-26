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

from app.services.email_service import send_invite_email

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
    
    invite_url = f"http://localhost:5173/accept-invite?token={token}"
    
    success = send_invite_email(
        to_email=invite.email,
        inviter_name=current_user.full_name or current_user.email,
        org_name=org.name,
        invite_url=invite_url
    )
    
    if not success:
        print(f"\n--- MOCK EMAIL ---")
        print(f"To: {invite.email}")
        print(f"Subject: You've been invited to {org.name}")
        print(f"Link: {invite_url}")
        print(f"------------------\n")
    
    return invite

@router.get("/", response_model=list[InviteOut])
def list_invites(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user), 
    org: Organization = Depends(get_current_organization),
    role = Depends(RoleChecker(['admin', 'owner']))
):
    return db.query(Invite).filter(Invite.organization_id == org.id, Invite.status != 'generic').all()

@router.get("/generic", response_model=InviteOut)
def get_generic_invite(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_organization),
    role = Depends(RoleChecker(['admin', 'owner']))
):
    invite = db.query(Invite).filter(Invite.organization_id == org.id, Invite.status == 'generic').first()
    if not invite:
        token = uuid.uuid4().hex
        invite = Invite(
            email='generic@invite.local',
            organization_id=org.id,
            token=token,
            role='member',
            status='generic'
        )
        db.add(invite)
        db.commit()
        db.refresh(invite)
    return invite

@router.post("/accept")
def accept_invite(
    accept_data: InviteAccept,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invite = db.query(Invite).filter(
        Invite.token == accept_data.token, 
        Invite.status.in_(['pending', 'generic'])
    ).first()
    
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
        
    if invite.status == 'pending':
        invite.status = 'accepted'
        
    db.commit()
    
    return {"message": "Invite accepted", "organization_id": invite.organization_id}
