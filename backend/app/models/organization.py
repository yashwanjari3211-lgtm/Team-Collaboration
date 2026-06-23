from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table
from sqlalchemy.sql import func
from app.database import Base

organization_members = Table(
    'organization_members',
    Base.metadata,
    Column('organization_id', Integer, ForeignKey('organizations.id')),
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('role', String, default='member')
)

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class OrganizationMember(Base):
    __tablename__ = "organization_members_extended"
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey('organizations.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    role = Column(String, default='member')
