from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..models import Task
from ..schemas import TaskOut
from ..schemas import TaskCreate
from ..deps_auth import get_current_user, get_db

router = APIRouter(prefix="/tasks", tags=["Tasks"])


# ------------------ GET ALL TASKS (only for logged-in user) ------------------

@router.get("/", response_model=list[TaskOut])
def get_tasks(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    tasks = db.query(Task).filter(Task.user_id == user.id).all()
    return tasks


# ------------------ MARK TASK COMPLETE ------------------

@router.put("/{task_id}/complete")
def mark_complete(
    task_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.completed = True
    db.commit()
    return {"message": "Task marked as complete"}


# ------------------ DELETE TASK ------------------

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}

@router.put("/{task_id}")
def update_task(
    task_id: int,
    updated: TaskCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.description = updated.description
    task.owner = updated.owner
    task.deadline = updated.deadline
    task.priority = updated.priority

    db.commit()
    return {"message": "Task updated"}


@router.put("/{task_id}/undo")
def mark_undo(
    task_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.completed = False
    db.commit()
    return {"message": "Task marked as pending"}