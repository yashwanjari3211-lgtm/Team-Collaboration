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
    labels: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    board_id: Optional[int] = None
    column_id: Optional[int] = None
    assignee_id: Optional[int] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    order: Optional[int] = None
    labels: Optional[str] = None

class TaskCommentCreate(BaseModel):
    content: str

class TaskCommentOut(BaseModel):
    id: int
    task_id: int
    user_id: int
    content: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

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
    labels: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskPositionUpdate(BaseModel):
    id: int
    column_id: int
    order: int
