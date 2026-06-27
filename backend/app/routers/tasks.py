from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.task import TaskCreate, TaskOut, TaskUpdate
from app.models.task import Task
from app.models.user import User
from app.models.organization import Organization
from app.utils.dependencies import get_current_user, get_current_organization
from app.services.websocket_manager import manager
import json
from fastapi.encoders import jsonable_encoder

router = APIRouter()

@router.post("/", response_model=TaskOut)
async def create_task(task: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    db_task = Task(**task.dict(), organization_id=org.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Broadcast to org room
    room_id = f"org_{org.id}"
    await manager.broadcast(room_id, {
        "type": "task_created",
        "task": jsonable_encoder(db_task)
    })
    
    return db_task

@router.get("/", response_model=list[TaskOut])
def list_tasks(board_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    return db.query(Task).filter(Task.board_id == board_id, Task.organization_id == org.id).order_by(Task.order).all()

from app.schemas.task import TaskPositionUpdate
from typing import List

@router.post("/reorder")
async def reorder_tasks(updates: List[TaskPositionUpdate], db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    updated_tasks = []
    for update in updates:
        db_task = db.query(Task).filter(Task.id == update.id, Task.organization_id == org.id).first()
        if db_task:
            db_task.column_id = update.column_id
            db_task.order = update.order
            updated_tasks.append(db_task)
    
    db.commit()
    
    room_id = f"org_{org.id}"
    for task in updated_tasks:
        db.refresh(task)
        await manager.broadcast(room_id, {
            "type": "task_updated",
            "task": jsonable_encoder(task)
        })
    
    return {"status": "success"}

@router.patch("/{task_id}", response_model=TaskOut)
async def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    db_task = db.query(Task).filter(Task.id == task_id, Task.organization_id == org.id).first()
    for key, value in task_update.dict(exclude_unset=True).items():
        setattr(db_task, key, value)
    db.commit()
    db.refresh(db_task)
    
    # Broadcast to org room
    room_id = f"org_{org.id}"
    await manager.broadcast(room_id, {
        "type": "task_updated",
        "task": jsonable_encoder(db_task)
    })
    
    return db_task

@router.delete("/{task_id}")
async def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    db_task = db.query(Task).filter(Task.id == task_id, Task.organization_id == org.id).first()
    if not db_task:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(db_task)
    db.commit()
    
    # Broadcast deletion
    room_id = f"org_{org.id}"
    await manager.broadcast(room_id, {
        "type": "task_deleted",
        "task_id": task_id,
        "column_id": db_task.column_id
    })
    
    return {"message": "Task deleted"}

from app.schemas.task import TaskCommentCreate, TaskCommentOut
from app.models.task import TaskComment

@router.get("/{task_id}/comments", response_model=list[TaskCommentOut])
def list_task_comments(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    # Verify task exists in this org
    task = db.query(Task).filter(Task.id == task_id, Task.organization_id == org.id).first()
    if not task:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Task not found")
        
    return db.query(TaskComment).filter(TaskComment.task_id == task_id).order_by(TaskComment.created_at.desc()).all()

@router.post("/{task_id}/comments", response_model=TaskCommentOut)
async def create_task_comment(task_id: int, comment: TaskCommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    task = db.query(Task).filter(Task.id == task_id, Task.organization_id == org.id).first()
    if not task:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Task not found")
        
    db_comment = TaskComment(
        task_id=task_id,
        user_id=current_user.id,
        content=comment.content
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    # Optional: fetch user data to include in broadcast if needed
    
    room_id = f"org_{org.id}"
    await manager.broadcast(room_id, {
        "type": "task_comment_created",
        "comment": jsonable_encoder(db_comment)
    })
    
    return db_comment
