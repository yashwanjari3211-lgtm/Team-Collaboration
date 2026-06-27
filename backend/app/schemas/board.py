from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.schemas.task import TaskOut

class BoardColumnCreate(BaseModel):
    name: str
    order: Optional[int] = 0

class BoardColumnUpdate(BaseModel):
    name: Optional[str] = None
    order: Optional[int] = None

class BoardColumnOut(BaseModel):
    id: int
    name: str
    board_id: int
    order: int
    created_at: datetime
    updated_at: datetime
    tasks: List[TaskOut] = []

    class Config:
        from_attributes = True

class BoardCreate(BaseModel):
    name: str
    description: Optional[str] = None

class BoardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class BoardOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    organization_id: int
    created_at: datetime
    updated_at: datetime
    columns: List[BoardColumnOut] = []

    class Config:
        from_attributes = True
