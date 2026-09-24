from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Task as TaskModel


app = FastAPI(title="TaskNest")

# =========================
# Frontend
# =========================

app.mount(
    "/static",
    StaticFiles(directory="frontend"),
    name="frontend"
)


@app.get("/")
def serve_frontend():
    return FileResponse("frontend/index.html")

# =========================
# CORS Configuration
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# Pydantic Models
# =========================

# Data coming INTO the API
class TaskCreate(BaseModel):
    title: str
    description: str
    priority: str
    status: str


# Data going OUT of the API when returning a task
class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    priority: str
    status: str

    class Config:
        from_attributes = True


# Data coming INTO the API for partial updates
class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: str | None = None
    status: str | None = None


# Data going OUT of the API for simple messages
class MessageResponse(BaseModel):
    message: str


# =========================
# Basic Routes
# =========================

@app.get("/")
def root():
    return {"message": "Welcome to TaskNest"}


@app.get("/health")
def health_check():
    return {"Status": "TaskNest is running!"}


# =========================
# CREATE TASK
# =========================

@app.post("/tasks", response_model=TaskResponse)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db)
):
    task = TaskModel(
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        status=task_data.status
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


# =========================
# GET ALL TASKS
# =========================

@app.get("/tasks", response_model=list[TaskResponse])
def get_all_tasks(
    status: str | None = None,
    priority: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(TaskModel)

    if status:
        query = query.filter(TaskModel.status.ilike(status))

    if priority:
        query = query.filter(TaskModel.priority.ilike(priority))

    tasks = query.all()

    return tasks


# =========================
# GET ONE TASK
# =========================

@app.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db)
):
    task = db.query(TaskModel).filter(
        TaskModel.id == task_id
    ).first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return task


# =========================
# UPDATE TASK
# =========================

@app.patch("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db)
):
    task = db.query(TaskModel).filter(
        TaskModel.id == task_id
    ).first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    update_data = task_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)

    return task


# =========================
# DELETE TASK
# =========================

@app.delete("/tasks/{task_id}", response_model=MessageResponse)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db)
):
    task = db.query(TaskModel).filter(
        TaskModel.id == task_id
    ).first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()

    return {
        "message": "Task deleted successfully"
    }