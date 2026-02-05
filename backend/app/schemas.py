from datetime import datetime, timezone
from pydantic import BaseModel, validator
from typing import Optional

# ----------- INPUT FOR EXTRACT API -----------

class TextInput(BaseModel):
    text: str


# ----------- TASK SCHEMAS -----------

class TaskCreate(BaseModel):
    description: str
    owner: Optional[str] = None
    deadline: Optional[str] = None
    priority: str


class TaskOut(TaskCreate):
    id: int
    completed: bool
    created_at: Optional[datetime] = None

    @validator("created_at", pre=True, always=True)
    def normalize_created_at(cls, value):
        if value is None:
            return value
        if isinstance(value, str):
            try:
                value = datetime.fromisoformat(value)
            except ValueError:
                return value
        if isinstance(value, datetime) and value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str
