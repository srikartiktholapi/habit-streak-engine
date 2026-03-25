from pydantic import BaseModel, EmailStr
from typing import Optional


# ── User Schemas ──────────────────────────────

class UserCreate(BaseModel):
    email:    EmailStr
    password: str

class UserOut(BaseModel):
    id:    int
    email: EmailStr

    class Config:
        from_attributes = True


# ── Habit Schemas ─────────────────────────────

class HabitCreate(BaseModel):
    name:          str
    reminder_time: Optional[str] = None   # "HH:MM" format

class HabitUpdate(BaseModel):
    name:          Optional[str] = None
    reminder_time: Optional[str] = None

class HabitOut(BaseModel):
    id:             int
    name:           str
    streak:         int
    last_completed: Optional[str] = None
    reminder_time:  Optional[str] = None
    user_id:        int

    class Config:
        from_attributes = True


# ── Token Schemas ─────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type:   str

class TokenData(BaseModel):
    email: Optional[str] = None