from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.task import TaskCreate, TaskOut, TaskUpdate
from app.models.task import Task
from app.models.user import User
from app.models.organization import Organization
from app.utils.dependencies import get_current_user, get_current_organization

router = APIRouter()

@router.post("/", response_model=TaskOut)
def create_task(task: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    db_task = Task(**task.dict(), organization_id=org.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/", response_model=list[TaskOut])
def list_tasks(channel_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    return db.query(Task).filter(Task.channel_id == channel_id, Task.organization_id == org.id).all()

@router.patch("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    db_task = db.query(Task).filter(Task.id == task_id, Task.organization_id == org.id).first()
    for key, value in task_update.dict(exclude_unset=True).items():
        setattr(db_task, key, value)
    db.commit()
    db.refresh(db_task)
    return db_task
