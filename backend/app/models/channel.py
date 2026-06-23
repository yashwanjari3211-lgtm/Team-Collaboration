from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Channel(Base):
    __tablename__ = "channels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    workspace_id = Column(Integer, ForeignKey('workspaces.id'))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
