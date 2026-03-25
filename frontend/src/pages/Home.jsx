import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";

const FEATURES = [
  { icon:"🔥", title:"Streak Tracking",   desc:"Every day you complete a habit your streak grows. Miss one day and it resets — keeping you accountable." },
  { icon:"⚡", title:"One-Tap Complete",  desc:"Mark a habit done with a single click. Backend validates once-per-day and updates your streak automatically." },
  { icon:"🤖", title:"AI Habit Coach",    desc:"Chat with Claude AI about habit science and motivation. It even knows your current streaks for personalized advice." },
  { icon:"⏰", title:"Smart Reminders",   desc:"Set a reminder time per habit. A background scheduler checks every minute so nothing slips through." },
  { icon:"📊", title:"Progress Insights", desc:"A live stats bar and weekly activity chart show your consistency at a glance — no spreadsheets needed." },
  { icon:"🔐", title:"Secure & Private",  desc:"JWT authentication with bcrypt-hashed passwords. Your habits are yours alone." },
];

export default function Home() {
  const { token } = useAuth();
  const navigate  = useNavigate();

  return (
    <>
      <style>{`
        .home { position:relative; z-index:1; }

        .hero {
          min-height:calc(100vh - 56px);
          display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          text-align:center; padding:80px 24px 60px;
        }
        .hero-badge {
          display:inline-flex; align-items:center; gap:7px;
          padding:5px 14px; margin-bottom:28px;
          background:rgba(124,58,237,0.1);
          border:1px solid rgba(124,58,237,0.22);
          border-radius:20px; font-size:12px;
          color:var(--accent-hi); font-family:var(--mono);
          letter-spacing:0.06em;
          animation:pageIn 0.5s ease both;
        }
        .hero-title {
          font-size:clamp(40px,9vw,76px);
          font-weight:800; line-height:1.04;
          letter-spacing:-0.045em; margin-bottom:22px;
          animation:pageIn 0.5s 0.07s ease both;
        }
        .hero-title .grad {
          background:linear-gradient(135deg,var(--gold) 0%,var(--red) 45%,#B06EF4 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .hero-sub {
          font-size:clamp(15px,2.5vw,18px); color:var(--text-muted);
          max-width:520px; line-height:1.65; margin-bottom:40px; font-weight:400;
          animation:pageIn 0.5s 0.13s ease both;
        }
        .hero-btns {
          display:flex; gap:12px; flex-wrap:wrap;
          justify-content:center; margin-bottom:72px;
          animation:pageIn 0.5s 0.19s ease both;
        }
        .hero-stats {
          display:flex; gap:48px;
          animation:pageIn 0.5s 0.26s ease both;
        }
        .hero-stat-num { font-size:28px; font-weight:800; letter-spacing:-0.04em; text-align:center; }
        .hero-stat-lbl { font-size:11px; color:var(--text-muted); font-family:var(--mono); letter-spacing:0.07em; margin-top:2px; text-align:center; }

        .features { padding:80px 24px; max-width:1000px; margin:0 auto; }
        .features-eyebrow { font-size:11px; font-family:var(--mono); color:var(--accent-hi); letter-spacing:0.1em; margin-bottom:12px; }
        .features-title { font-size:clamp(26px,4vw,40px); font-weight:800; letter-spacing:-0.03em; margin-bottom:48px; }
        .features-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
        .feat-card {
          padding:24px; border-radius:var(--radius);
          background:var(--bg-card); border:1px solid var(--border);
          transition:all 0.25s;
        }
        .feat-card:hover { background:var(--bg-hover); border-color:var(--border-hi); transform:translateY(-2px); }
        .feat-icon  { font-size:24px; margin-bottom:14px; }
        .feat-title { font-size:15px; font-weight:700; margin-bottom:8px; letter-spacing:-0.01em; }
        .feat-desc  { font-size:13px; color:var(--text-muted); line-height:1.65; }

        .cta-section { padding:80px 24px; text-align:center; max-width:600px; margin:0 auto; }
        .cta-title { font-size:clamp(26px,4vw,44px); font-weight:800; letter-spacing:-0.03em; margin-bottom:14px; }
        .cta-sub   { font-size:15px; color:var(--text-muted); margin-bottom:32px; line-height:1.6; }
      `}</style>

      <div className="home page-enter">

        {/* ── Hero ── */}
        <section className="hero">
          <div className="hero-badge">✦ Build habits that actually stick</div>
          <h1 className="hero-title">
            Your habits.<br /><span className="grad">Your streaks.</span>
          </h1>
          <p className="hero-sub">
            Streak Engine tracks your daily habits with smart streak logic,
            AI coaching, and reminders — so you stay consistent, not just motivated.
          </p>
          <div className="hero-btns">
            <button className="btn btn-primary" style={{padding:"12px 28px",fontSize:15}}
              onClick={() => navigate(token ? "/dashboard" : "/register")}>
              {token ? "Open Dashboard →" : "Start for free →"}
            </button>
            <button className="btn btn-ghost" style={{padding:"12px 22px",fontSize:15}}
              onClick={() => navigate("/about")}>
              Learn more
            </button>
          </div>
          <div className="hero-stats">
            {[["100%","FREE"],["∞","HABITS"],["24/7","REMINDERS"]].map(([n,l]) => (
              <div key={l}>
                <div className="hero-stat-num">{n}</div>
                <div className="hero-stat-lbl">{l}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" style={{maxWidth:1000,margin:"0 auto"}} />

        {/* ── Features ── */}
        <section className="features">
          <div className="features-eyebrow">WHAT'S INSIDE</div>
          <h2 className="features-title">Everything you need to<br />build lasting habits</h2>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div className="feat-card" key={f.title}>
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" style={{maxWidth:1000,margin:"0 auto"}} />

        {/* ── CTA ── */}
        <section className="cta-section">
          <h2 className="cta-title">Ready to build your streak?</h2>
          <p className="cta-sub">Create an account and start tracking your first habit in under 60 seconds.</p>
          <button className="btn btn-primary" style={{padding:"13px 32px",fontSize:15}}
            onClick={() => navigate(token ? "/dashboard" : "/register")}>
            {token ? "Go to Dashboard →" : "Create free account →"}
          </button>
        </section>

      </div>
    </>
  );
}