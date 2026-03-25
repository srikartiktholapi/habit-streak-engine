from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # One user has many habits
    habits = relationship("Habit", back_populates="owner", cascade="all, delete")


class Habit(Base):
    __tablename__ = "habits"

    id             = Column(Integer, primary_key=True, index=True)
    name           = Column(String, nullable=False)
    streak         = Column(Integer, default=0)
    last_completed = Column(String, nullable=True)   # stored as "YYYY-MM-DD"
    reminder_time  = Column(String, nullable=True)   # stored as "HH:MM"
    user_id        = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Link back to user
    owner = relationship("User", back_populates="habits")