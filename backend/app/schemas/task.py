from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    board_id: int
    column_id: int
    assignee_id: Optional[int] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = 'medium'
    order: Optional[int] = 0

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    board_id: Optional[int] = None
    column_id: Optional[int] = None
    assignee_id: Optional[int] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    order: Optional[int] = None

class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    board_id: int
    column_id: int
    assignee_id: Optional[int]
    organization_id: int
    priority: str
    order: int
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
