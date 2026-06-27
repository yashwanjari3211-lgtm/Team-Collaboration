from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    
    # Kanban fields
    board_id = Column(Integer, ForeignKey('boards.id'), nullable=True)
    column_id = Column(Integer, ForeignKey('board_columns.id'), nullable=True)
    order = Column(Integer, default=0)
    priority = Column(String, default='medium') # low, medium, high, urgent
    
    # Old field, keep it nullable for migration if needed, but we will remove it in migration
    # Actually, we will remove channel_id entirely via Alembic, but keep it in SQLAlchemy if we want to avoid crashes during migration? 
    # No, Alembic reads this to generate drops. So remove channel_id here.
    
    assignee_id = Column(Integer, ForeignKey('users.id'))
    organization_id = Column(Integer, ForeignKey('organizations.id'))
    due_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    board = relationship("Board", back_populates="tasks")
    column = relationship("BoardColumn", back_populates="tasks")
