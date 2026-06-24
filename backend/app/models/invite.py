from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Invite(Base):
    __tablename__ = "invites"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    organization_id = Column(Integer, ForeignKey('organizations.id'), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default='member')
    status = Column(String, default='pending') # pending, accepted
    created_at = Column(DateTime(timezone=True), server_default=func.now())
