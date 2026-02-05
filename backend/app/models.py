from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    password = Column(String)


class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    owner = Column(String, nullable=True)
    deadline = Column(String, nullable=True)
    priority = Column(String)
    completed = Column(Boolean, default=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user_id = Column(Integer, ForeignKey("users.id"))
