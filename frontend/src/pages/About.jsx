import { useNavigate } from "react-router-dom";

const STACK = [
  { layer:"Frontend",    items:["React 18","Vite","React Router","CSS Variables"] },
  { layer:"Backend",     items:["Python","FastAPI","SQLAlchemy","SQLite"] },
  { layer:"Auth & Jobs", items:["JWT Tokens","bcrypt","APScheduler"] },
  { layer:"AI",          items:["Claude API","Habit Context","Multi-turn Chat"] },
];

const TIMELINE = [
  { n:"01", title:"Register",        desc:"Create an account with email and password. Credentials are hashed with bcrypt before storage." },
  { n:"02", title:"Add Habits",      desc:"Create habits with a name and optional reminder time. Each habit starts a fresh streak counter at zero." },
  { n:"03", title:"Complete Daily",  desc:"Mark habits done each day. The backend validates once-per-day and increments your streak automatically." },
  { n:"04", title:"Track Streaks",   desc:"Watch your streak grow. Miss a day and it resets — no exceptions. This is the core accountability mechanic." },
  { n:"05", title:"Get Reminders",   desc:"APScheduler runs in the background checking every minute if it's time to remind you about a habit." },
  { n:"06", title:"Consult AI",      desc:"Chat with Claude about your habits, get personalized advice, and understand your streak psychology." },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .about { position:relative; z-index:1; }

        .about-hero { text-align:center; padding:80px 24px 60px; max-width:640px; margin:0 auto; }
        .about-tag { display:inline-block; font-size:11px; font-family:var(--mono); color:var(--accent-hi); letter-spacing:0.1em; padding:4px 12px; background:rgba(124,58,237,0.1); border:1px solid rgba(124,58,237,0.2); border-radius:20px; margin-bottom:20px; }
        .about-title { font-size:clamp(30px,5vw,52px); font-weight:800; letter-spacing:-0.04em; line-height:1.1; margin-bottom:16px; }
        .about-sub { font-size:15px; color:var(--text-muted); line-height:1.7; }

        .section { padding:60px 24px; max-width:860px; margin:0 auto; }
        .sec-eyebrow { font-family:var(--mono); font-size:11px; color:var(--accent-hi); letter-spacing:0.1em; margin-bottom:10px; }
        .sec-title { font-size:clamp(22px,3vw,32px); font-weight:800; letter-spacing:-0.03em; margin-bottom:8px; }
        .sec-sub { font-size:14px; color:var(--text-muted); margin-bottom:40px; line-height:1.7; }

        .timeline { display:flex; flex-direction:column; }
        .tl-item { display:flex; gap:24px; padding:22px 0; border-bottom:1px solid var(--border); }
        .tl-item:last-child { border-bottom:none; }
        .tl-num { font-size:11px; font-family:var(--mono); color:var(--accent-hi); letter-spacing:0.08em; padding-top:3px; flex-shrink:0; width:24px; }
        .tl-title { font-size:15px; font-weight:700; margin-bottom:5px; letter-spacing:-0.01em; }
        .tl-desc { font-size:13px; color:var(--text-muted); line-height:1.65; }

        .stack-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:12px; }
        .stack-card { padding:20px; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius); transition:all 0.2s; }
        .stack-card:hover { background:var(--bg-hover); border-color:var(--border-hi); }
        .stack-layer { font-size:10px; font-family:var(--mono); color:var(--accent-hi); letter-spacing:0.1em; margin-bottom:10px; }
        .stack-item { font-size:13px; color:var(--text-muted); margin-bottom:4px; }
      `}</style>

      <div className="about page-enter">

        {/* Hero */}
        <div className="about-hero">
          <div className="about-tag">ABOUT THE PROJECT</div>
          <h1 className="about-title">Built to make habits unavoidable</h1>
          <p className="about-sub">
            Streak Engine is a full-stack habit tracker built with FastAPI, React,
            and Claude AI — combining behavioral psychology with a clean modern UI
            to make consistency feel effortless.
          </p>
        </div>

        <div className="divider" style={{maxWidth:860,margin:"0 auto"}} />

        {/* How it works */}
        <section className="section">
          <div className="sec-eyebrow">HOW IT WORKS</div>
          <h2 className="sec-title">From signup to streak in 6 steps</h2>
          <p className="sec-sub">The full user journey from creating an account to using AI coaching.</p>
          <div className="timeline">
            {TIMELINE.map(t => (
              <div className="tl-item" key={t.n}>
                <div className="tl-num">{t.n}</div>
                <div>
                  <div className="tl-title">{t.title}</div>
                  <div className="tl-desc">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" style={{maxWidth:860,margin:"0 auto"}} />

        {/* Tech stack */}
        <section className="section">
          <div className="sec-eyebrow">TECH STACK</div>
          <h2 className="sec-title">Modern, production-grade tools</h2>
          <p className="sec-sub">Every technology chosen for a clear reason — not just to pad a resume.</p>
          <div className="stack-grid">
            {STACK.map(s => (
              <div className="stack-card" key={s.layer}>
                <div className="stack-layer">{s.layer.toUpperCase()}</div>
                {s.items.map(item => (
                  <div className="stack-item" key={item}>· {item}</div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <div className="divider" style={{maxWidth:860,margin:"0 auto"}} />

        {/* CTA */}
        <section style={{padding:"60px 24px",textAlign:"center"}}>
          <h2 style={{fontSize:"clamp(24px,3vw,36px)",fontWeight:800,letterSpacing:"-0.03em",marginBottom:12}}>
            See it in action
          </h2>
          <p style={{fontSize:14,color:"var(--text-muted)",marginBottom:28}}>
            Create an account or log in to explore the dashboard and AI coach.
          </p>
          <button className="btn btn-primary" style={{padding:"12px 28px",fontSize:14}}
            onClick={() => navigate("/register")}>
            Get started →
          </button>
        </section>

      </div>
    </>
  );
}