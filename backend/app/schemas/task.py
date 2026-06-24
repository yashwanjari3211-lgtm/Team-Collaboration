from pydantic import BaseModel
from datetime import datetime

class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    channel_id: int
    assignee_id: int | None = None
    due_date: datetime | None = None

class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    assignee_id: int | None = None
    due_date: datetime | None = None

class TaskOut(BaseModel):
    id: int
    title: str
    description: str | None
    status: str
    assignee_id: int | None
    channel_id: int
    organization_id: int
    due_date: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True
