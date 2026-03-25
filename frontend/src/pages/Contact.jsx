import { useState } from "react";
import { sendContact } from "../api/api";

const SOCIAL = [
  { name:"GitHub",      icon:"⌥",  desc:"View source code",       href:"https://github.com" },
  { name:"LinkedIn",    icon:"in",  desc:"Connect professionally", href:"https://linkedin.com" },
  { name:"Twitter / X", icon:"𝕏",  desc:"Follow for updates",     href:"https://x.com" },
];

export default function Contact() {
  const [form,    setForm]    = useState({ name:"", email:"", message:"" });
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    setError("");
    try {
      await sendContact(form);
      setSent(true);
    } catch (e) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .contact { position:relative; z-index:1; max-width:860px; margin:0 auto; padding:60px 24px 80px; }
        .contact-tag { font-size:11px; font-family:var(--mono); color:var(--accent-hi); letter-spacing:0.1em; margin-bottom:12px; display:block; }
        .contact-title { font-size:clamp(30px,5vw,52px); font-weight:800; letter-spacing:-0.04em; line-height:1.05; margin-bottom:14px; }
        .contact-sub { font-size:15px; color:var(--text-muted); line-height:1.7; max-width:480px; margin-bottom:52px; }
        .contact-grid { display:grid; grid-template-columns:1fr 1fr; gap:40px; }
        @media(max-width:640px){ .contact-grid{ grid-template-columns:1fr; } }
        .form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
        @media(max-width:480px){ .form-row{ grid-template-columns:1fr; } }

        .success-box {
          padding:28px; border-radius:var(--radius);
          background:rgba(110,223,160,0.07); border:1px solid rgba(110,223,160,0.2);
          color:var(--green); text-align:center; line-height:1.6;
        }

        .aside-card { padding:22px; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius); margin-bottom:12px; transition:all 0.2s; }
        .aside-card:hover { background:var(--bg-hover); border-color:var(--border-hi); }
        .aside-icon  { font-size:20px; margin-bottom:10px; }
        .aside-title { font-size:14px; font-weight:700; margin-bottom:4px; }
        .aside-desc  { font-size:12px; color:var(--text-muted); line-height:1.6; }

        .social-link {
          display:flex; align-items:center; gap:14px;
          padding:14px; background:var(--bg-card); border:1px solid var(--border);
          border-radius:var(--radius-sm); transition:all 0.2s; margin-bottom:8px;
        }
        .social-link:hover { background:var(--bg-hover); border-color:var(--border-hi); transform:translateX(3px); }
        .social-icon { width:34px; height:34px; border-radius:9px; background:rgba(124,58,237,0.15); border:1px solid rgba(124,58,237,0.2); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:var(--accent-hi); flex-shrink:0; }
        .social-name { font-size:13px; font-weight:600; margin-bottom:1px; }
        .social-desc { font-size:11px; color:var(--text-muted); }
        .contact-error { font-size:12px; color:var(--red); background:rgba(244,116,106,0.08); border:1px solid rgba(244,116,106,0.2); border-radius:8px; padding:9px 12px; margin-bottom:16px; }
      `}</style>

      <div className="contact page-enter">

        {/* Header */}
        <span className="contact-tag">CONTACT</span>
        <h1 className="contact-title">Let's get in touch</h1>
        <p className="contact-sub">
          Have a question, feedback, or want to say hi?
          Send a message or reach out on social media.
        </p>

        <div className="contact-grid">

          {/* Left — Form */}
          <div>
            {sent ? (
              <div className="success-box">
                <div style={{fontSize:32,marginBottom:10}}>✓</div>
                <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>Message sent!</div>
                <div style={{color:"var(--text-muted)",fontSize:13}}>
                  Thanks for reaching out. I'll get back to you soon.
                </div>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:0}}>
                <div className="form-row">
                  <div>
                    <label className="field-label">NAME</label>
                    <input className="field-input" placeholder="Your name"
                      value={form.name} onChange={set("name")} />
                  </div>
                  <div>
                    <label className="field-label">EMAIL</label>
                    <input className="field-input" type="email" placeholder="you@example.com"
                      value={form.email} onChange={set("email")} />
                  </div>
                </div>
                <div style={{marginBottom:20}}>
                  <label className="field-label">MESSAGE</label>
                  <textarea className="field-input" placeholder="What's on your mind?"
                    value={form.message} onChange={set("message")} />
                </div>
                {error && <div className="contact-error">{error}</div>}
                <button className="btn btn-primary"
                  style={{alignSelf:"flex-start", padding:"10px 24px"}}
                  onClick={submit}
                  disabled={loading || !form.name || !form.email || !form.message}>
                  {loading ? "Sending…" : "Send message →"}
                </button>
              </div>
            )}
          </div>

          {/* Right — Aside */}
          <div>
            <div className="aside-card">
              <div className="aside-icon">📬</div>
              <div className="aside-title">Response time</div>
              <div className="aside-desc">I typically respond within 24–48 hours. For urgent matters reach out via Twitter.</div>
            </div>
            <div className="aside-card">
              <div className="aside-icon">💼</div>
              <div className="aside-title">Open to opportunities</div>
              <div className="aside-desc">Currently open to full-stack engineering roles. Feel free to reach out with job opportunities.</div>
            </div>

            <div style={{marginTop:8}}>
              {SOCIAL.map(s => (
                <a key={s.name} href={s.href} target="_blank" rel="noreferrer" className="social-link">
                  <div className="social-icon">{s.icon}</div>
                  <div>
                    <div className="social-name">{s.name}</div>
                    <div className="social-desc">{s.desc}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}