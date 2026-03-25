from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import date, timedelta, datetime
from apscheduler.schedulers.background import BackgroundScheduler
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pydantic import BaseModel as PydanticBase
from typing import List
from dotenv import load_dotenv
import os
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

from database import engine, get_db, Base, SessionLocal
from models import User, Habit
from schemas import UserCreate, UserOut, HabitCreate, HabitUpdate, HabitOut, Token
from auth import (
    hash_password, verify_password,
    create_access_token, get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

# ── Email Config ──────────────────────────────
SENDER_EMAIL    = os.getenv("SENDER_EMAIL", "srikartiktholapi@gmail.com")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD", "vjvmwphcpshwhkxl")

# ── App Setup ─────────────────────────────────
app = FastAPI(title="Streak Engine API")

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Email Helper ──────────────────────────────
def send_reminder_email(to_email: str, habit_name: str):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🔥 Reminder: Time to do '{habit_name}'!"
        msg["From"]    = SENDER_EMAIL
        msg["To"]      = to_email

        text = f"Hey! Don't forget to complete your habit: {habit_name}\n\nKeep your streak alive! 🔥"

        html = f"""
        <html>
          <body style="font-family:sans-serif;background:#08070E;color:#EDE8F5;padding:40px;">
            <div style="max-width:480px;margin:0 auto;background:#0F0D1C;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;">
              <div style="font-size:36px;margin-bottom:16px;">🔥</div>
              <h2 style="color:#EDE8F5;margin-bottom:8px;">Habit Reminder</h2>
              <p style="color:#7A728A;margin-bottom:24px;">Don't break your streak!</p>
              <div style="background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
                <div style="font-size:18px;font-weight:700;color:#EDE8F5;">{habit_name}</div>
                <div style="font-size:13px;color:#7A728A;margin-top:4px;">Complete this habit today</div>
              </div>
              <a href="http://localhost:5173/dashboard"
                style="display:inline-block;background:#7C3AED;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;">
                Open Dashboard →
              </a>
            </div>
          </body>
        </html>
        """

        msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, to_email, msg.as_string())

        print(f"✅ Reminder sent to {to_email} for: {habit_name}")

    except Exception as e:
        print(f"❌ Failed to send email: {e}")


# ── Reminder Scheduler ────────────────────────
def check_reminders():
    db = SessionLocal()
    current_time = datetime.now().strftime("%H:%M")
    try:
        habits = db.query(Habit).filter(Habit.reminder_time == current_time).all()
        for habit in habits:
            user = db.query(User).filter(User.id == habit.user_id).first()
            if user:
                send_reminder_email(user.email, habit.name)
    finally:
        db.close()

scheduler = BackgroundScheduler()
scheduler.add_job(check_reminders, "interval", minutes=1)
scheduler.start()


# ══════════════════════════════════════════════
#  ROUTES
# ══════════════════════════════════════════════

@app.get("/")
def root():
    return {"message": "Streak Engine API is running 🔥"}


# ── Auth ──────────────────────────────────────

@app.post("/register", response_model=UserOut)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = User(
        email           = user_data.email,
        hashed_password = hash_password(user_data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}


# ── Habits ────────────────────────────────────

@app.get("/habits", response_model=list[HabitOut])
def get_habits(
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db)
):
    return db.query(Habit).filter(Habit.user_id == current_user.id).all()


@app.post("/habits", response_model=HabitOut)
def create_habit(
    habit_data:   HabitCreate,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db)
):
    new_habit = Habit(
        name          = habit_data.name,
        reminder_time = habit_data.reminder_time,
        user_id       = current_user.id
    )
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)
    return new_habit


@app.put("/habits/{habit_id}", response_model=HabitOut)
def update_habit(
    habit_id:     int,
    habit_data:   HabitUpdate,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db)
):
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    if habit_data.name          is not None: habit.name          = habit_data.name
    if habit_data.reminder_time is not None: habit.reminder_time = habit_data.reminder_time

    db.commit()
    db.refresh(habit)
    return habit


@app.delete("/habits/{habit_id}")
def delete_habit(
    habit_id:     int,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db)
):
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    db.delete(habit)
    db.commit()
    return {"message": "Habit deleted"}


@app.post("/habits/{habit_id}/complete", response_model=HabitOut)
def complete_habit(
    habit_id:     int,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db)
):
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    today     = date.today().isoformat()
    yesterday = (date.today() - timedelta(days=1)).isoformat()

    if habit.last_completed == today:
        raise HTTPException(status_code=400, detail="Habit already completed today")

    habit.streak         = (habit.streak + 1) if habit.last_completed == yesterday else 1
    habit.last_completed = today
    db.commit()
    db.refresh(habit)
    return habit


# ── AI Coach ──────────────────────────────────

class ChatMessage(PydanticBase):
    role:    str
    content: str

class ChatRequest(PydanticBase):
    messages:      List[ChatMessage]
    habit_context: str = ""
# ── Contact Form ──────────────────────────────

class ContactMessage(PydanticBase):
    name:    str
    email:   str
    message: str

@app.post("/contact")
def contact(data: ContactMessage):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"📬 New message from {data.name} via Streak Engine"
        msg["From"]    = SENDER_EMAIL
        msg["To"]      = SENDER_EMAIL  # sends to YOUR email

        html = f"""
        <html>
          <body style="font-family:sans-serif;background:#08070E;color:#EDE8F5;padding:40px;">
            <div style="max-width:480px;margin:0 auto;background:#0F0D1C;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;">
              <div style="font-size:36px;margin-bottom:16px;">📬</div>
              <h2 style="color:#EDE8F5;margin-bottom:20px;">New Contact Message</h2>
              <div style="margin-bottom:12px;">
                <div style="font-size:11px;color:#7A728A;margin-bottom:4px;letter-spacing:0.08em;">FROM</div>
                <div style="font-size:15px;font-weight:700;">{data.name}</div>
              </div>
              <div style="margin-bottom:12px;">
                <div style="font-size:11px;color:#7A728A;margin-bottom:4px;letter-spacing:0.08em;">EMAIL</div>
                <div style="font-size:14px;color:#9461F7;">{data.email}</div>
              </div>
              <div style="margin-bottom:24px;">
                <div style="font-size:11px;color:#7A728A;margin-bottom:8px;letter-spacing:0.08em;">MESSAGE</div>
                <div style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.2);border-radius:10px;padding:16px;font-size:14px;line-height:1.7;">
                  {data.message}
                </div>
              </div>
              <a href="mailto:{data.email}" style="display:inline-block;background:#7C3AED;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;">
                Reply to {data.name} →
              </a>
            </div>
          </body>
        </html>
        """

        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, SENDER_EMAIL, msg.as_string())

        print(f"📬 Contact message from {data.name} ({data.email})")
        return {"success": True}

    except Exception as e:
        print(f"❌ Contact email failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to send message")
    
@app.post("/ai/chat")
def ai_chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        messages = []

        messages.append({
            "role": "system",
            "content": f"You are an expert habit coach and behavioral psychologist. Help users build and maintain habits, understand streak psychology, and stay motivated. Be warm, practical, and science-backed. Keep responses to 2-4 short paragraphs. {request.habit_context}"
        })

        for msg in request.messages:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages
        )

        return {"reply": response.choices[0].message.content}

    except Exception as e:
        print("❌ Groq Error:", e)
        raise HTTPException(status_code=500, detail=str(e))
