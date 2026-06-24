from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError
from app.database import get_db
from app.models.user import User
from app.services.auth_service import verify_token
from fastapi import Request
from app.models.organization import Organization, OrganizationMember

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> User:
    try:
        payload = verify_token(credentials.credentials)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        return user
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

def get_current_organization(request: Request, db: Session = Depends(get_db)):
    org_id = request.headers.get("X-Organization-Id")
    if not org_id:
        raise HTTPException(status_code=400, detail="X-Organization-Id header missing")
    org = db.query(Organization).filter(Organization.id == int(org_id)).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization), db: Session = Depends(get_db)):
        member = db.query(OrganizationMember).filter(
            OrganizationMember.organization_id == org.id,
            OrganizationMember.user_id == user.id
        ).first()
        
        if not member:
            raise HTTPException(status_code=403, detail="User is not a member of this organization")
            
        if member.role not in self.allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
            
        return member
