import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { getHabits, createHabit, deleteHabit, completeHabit } from "../api/api";

const today        = () => new Date().toISOString().split("T")[0];
const doneToday    = (h) => h.last_completed === today();
const streakColor  = (s) => s >= 21 ? "var(--gold)" : s >= 7 ? "var(--green)" : s >= 3 ? "var(--blue)" : "var(--text-muted)";
const streakLabel  = (s) => s >= 21 ? "🔥 Blazing" : s >= 7 ? "⚡ On Fire" : s >= 3 ? "✨ Building" : "🌱 Starting";

// ── Streak Ring ───────────────────────────────
function StreakRing({ streak, size = 52 }) {
  const r    = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(streak / 30, 1);
  const color = streakColor(streak);
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${circ*pct} ${circ}`} strokeLinecap="round"
        style={{transition:"stroke-dasharray 0.7s cubic-bezier(0.34,1.56,0.64,1)",
                filter:`drop-shadow(0 0 5px ${color})`}} />
    </svg>
  );
}

// ── Week Bar Chart ────────────────────────────
function WeekBar({ habits }) {
  const days = Array.from({length:7}, (_,i) => {
    const d  = new Date(Date.now() - (6-i) * 86400000);
    const ds = d.toISOString().split("T")[0];
    return {
      label:   d.toLocaleDateString("en",{weekday:"short"}).slice(0,1),
      count:   habits.filter(h => h.last_completed === ds).length,
      isToday: ds === today(),
    };
  });
  const max = Math.max(...days.map(d => d.count), 1);
  return (
    <div style={{display:"flex",gap:6,alignItems:"flex-end",height:52}}>
      {days.map((d,i) => (
        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
          <div style={{
            width:"100%", borderRadius:4,
            height: d.count ? `${Math.max(8,(d.count/max)*36)}px` : "4px",
            background: d.isToday
              ? `rgba(110,223,160,${0.4+(d.count/max)*0.55})`
              : d.count ? `rgba(124,58,237,${0.3+(d.count/max)*0.5})` : "rgba(255,255,255,0.05)",
            transition:"height 0.5s cubic-bezier(0.34,1.56,0.64,1)",
          }}/>
          <span style={{fontSize:9,color:d.isToday?"var(--green)":"var(--text-dim)",fontFamily:"var(--mono)"}}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Add Habit Modal ───────────────────────────
function AddModal({ onAdd, onClose }) {
  const [name, setName] = useState("");
  const [time, setTime] = useState("08:00");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await onAdd({ name: name.trim(), reminder_time: time });
    setLoading(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>New Habit</div>
        <div style={{fontSize:13,color:"var(--text-muted)",marginBottom:24}}>
          What do you want to build consistency in?
        </div>
        <div style={{marginBottom:14}}>
          <label className="field-label">HABIT NAME</label>
          <input className="field-input" value={name} autoFocus
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="e.g. Morning Run, Read 30 mins…" />
        </div>
        <div style={{marginBottom:28}}>
          <label className="field-label">REMINDER TIME</label>
          <input className="field-input" type="time" value={time}
            onChange={e => setTime(e.target.value)} />
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}
            disabled={loading || !name.trim()}>
            {loading ? "Adding…" : "Add Habit →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────
export default function Dashboard() {
  const { token, user } = useAuth();
  const [habits,   setHabits]  = useState([]);
  const [showAdd,  setShowAdd] = useState(false);
  const [loading,  setLoading] = useState(true);
  const [removing, setRemoving]= useState(null);
  const [toast,    setToast]   = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    getHabits(token)
      .then(setHabits)
      .catch(() => showToast("Failed to load habits","error"))
      .finally(() => setLoading(false));
  }, []);

  const addHabit = async (habit) => {
    const data = await createHabit(token, habit);
    setHabits(prev => [...prev, data]);
    showToast(`"${habit.name}" added!`);
  };

  const complete = async (id) => {
    try {
      const data = await completeHabit(token, id);
      setHabits(prev => prev.map(h => h.id === id ? data : h));
      showToast("Streak updated! 🔥");
    } catch(e) { showToast(e.message, "error"); }
  };

  const remove = (id) => {
    setRemoving(id);
    setTimeout(async () => {
      setHabits(prev => prev.filter(h => h.id !== id));
      try { await deleteHabit(token, id); } catch {}
      setRemoving(null);
    }, 350);
  };

  const doneCount = habits.filter(doneToday).length;
  const sorted    = [...habits].sort((a,b) => doneToday(a) - doneToday(b) || b.streak - a.streak);

  return (
    <>
      <style>{`
        .dash { max-width:620px; margin:0 auto; padding:28px 20px 60px; position:relative; z-index:1; }
        .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--border); border-radius:var(--radius); overflow:hidden; margin-bottom:24px; }
        .stat-box { background:var(--bg); padding:14px 10px; text-align:center; transition:background 0.2s; }
        .stat-box:hover { background:var(--bg-hover); }
        .stat-val { font-size:22px; font-weight:800; letter-spacing:-0.03em; }
        .stat-key { font-size:9px; color:var(--text-dim); font-family:var(--mono); letter-spacing:0.08em; margin-top:2px; }
        .sec-label { font-size:10px; font-family:var(--mono); color:var(--text-dim); letter-spacing:0.08em; margin-bottom:10px; }
        .habit-card {
          display:flex; align-items:center; gap:14px;
          background:var(--bg-card); border:1px solid var(--border);
          border-radius:var(--radius); padding:14px 14px 14px 12px;
          transition:opacity 0.35s, transform 0.35s, background 0.2s, border-color 0.2s;
          animation:pageIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .habit-card:hover { background:var(--bg-hover); border-color:var(--border-hi); }
        .hab-btn {
          width:34px; height:34px; border-radius:10px;
          border:1px solid var(--border); background:var(--bg-card);
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          transition:all 0.2s; flex-shrink:0;
        }
        .hab-btn-complete:hover:not(:disabled) { background:rgba(110,223,160,0.1); border-color:rgba(110,223,160,0.3); transform:scale(1.08); }
        .hab-btn-done { background:rgba(110,223,160,0.07); border-color:rgba(110,223,160,0.18); cursor:default; }
        .hab-btn-del:hover { background:rgba(244,116,106,0.1); border-color:rgba(244,116,106,0.3); }
        @media(max-width:480px){ .stats-row{ grid-template-columns:repeat(2,1fr); } }
      `}</style>

      <div className="dash page-enter">

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
          <div>
            <div style={{fontSize:22,fontWeight:800,letterSpacing:"-0.02em",marginBottom:4}}>
              {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening"} 👋
            </div>
            <div style={{fontSize:13,color:"var(--text-muted)"}}>
              {user?.email} · {new Date().toLocaleDateString("en",{weekday:"long",month:"long",day:"numeric"})}
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ New Habit</button>
        </div>

        {/* Stats */}
        <div className="stats-row">
          {[
            {val:`${doneCount}/${habits.length}`, key:"TODAY"},
            {val:habits.reduce((m,h)=>Math.max(m,h.streak),0), key:"BEST STREAK"},
            {val:habits.length ? (habits.reduce((s,h)=>s+h.streak,0)/habits.length).toFixed(1) : 0, key:"AVG STREAK"},
            {val:habits.length, key:"TOTAL HABITS"},
          ].map(s => (
            <div className="stat-box" key={s.key}>
              <div className="stat-val">{s.val}</div>
              <div className="stat-key">{s.key}</div>
            </div>
          ))}
        </div>

        {/* Week chart */}
        <div style={{marginBottom:28}}>
          <div className="sec-label">THIS WEEK</div>
          <WeekBar habits={habits} />
        </div>

        {/* Habits list */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div className="sec-label" style={{marginBottom:0}}>YOUR HABITS — {habits.length}</div>
          {doneCount === habits.length && habits.length > 0 && (
            <span style={{fontSize:11,color:"var(--green)",fontFamily:"var(--mono)",
              padding:"3px 10px",background:"rgba(110,223,160,0.08)",borderRadius:20}}>
              All done ✓
            </span>
          )}
        </div>

        {loading ? (
          <div style={{textAlign:"center",padding:"40px 0",color:"var(--text-dim)",fontFamily:"var(--mono)",fontSize:13}}>
            Loading habits…
          </div>
        ) : sorted.length === 0 ? (
          <div style={{textAlign:"center",padding:"60px 0",color:"var(--text-muted)"}}>
            <div style={{fontSize:40,marginBottom:12,opacity:0.4}}>🌱</div>
            <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>No habits yet</div>
            <div style={{fontSize:13}}>Add your first habit to start your streak.</div>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {sorted.map((h,i) => {
              const done  = doneToday(h);
              const color = streakColor(h.streak);
              return (
                <div key={h.id} className="habit-card"
                  style={{
                    opacity:   removing === h.id ? 0 : 1,
                    transform: removing === h.id ? "translateX(30px) scale(0.97)" : "translateX(0)",
                    animationDelay: `${i * 0.06}s`,
                  }}>

                  {/* Left color bar */}
                  <div style={{width:3,borderRadius:2,background:color,alignSelf:"stretch",flexShrink:0,transition:"background 0.4s"}} />

                  {/* Streak ring */}
                  <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",width:52,height:52,flexShrink:0}}>
                    <StreakRing streak={h.streak} size={52} />
                    <div style={{position:"absolute",fontSize:13,fontWeight:700,color,fontFamily:"var(--mono)",lineHeight:1}}>
                      {h.streak}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:600,marginBottom:4,letterSpacing:"-0.01em",
                      color: done ? "var(--text-muted)" : "var(--text)",
                      textDecoration: done ? "line-through" : "none",
                      textDecorationColor:"rgba(255,255,255,0.25)"}}>
                      {h.name}
                    </div>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <span style={{fontSize:11,color:"var(--text-dim)",fontFamily:"var(--mono)"}}>⏰ {h.reminder_time || "—"}</span>
                      <span style={{fontSize:11,fontFamily:"var(--mono)",color,opacity:0.85}}>{streakLabel(h.streak)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{display:"flex",gap:7,flexShrink:0}}>
                    <button className={`hab-btn hab-btn-complete ${done ? "hab-btn-done" : ""}`}
                      onClick={() => !done && complete(h.id)} disabled={done}>
                      {done
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12L10 17L19 8" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/><path d="M8 12L11 15L16 9" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      }
                    </button>
                    <button className="hab-btn hab-btn-del" onClick={() => remove(h.id)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && <AddModal onAdd={addHabit} onClose={() => setShowAdd(false)} />}

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}