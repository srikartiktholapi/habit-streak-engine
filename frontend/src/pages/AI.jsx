import { useState, useRef, useEffect } from "react";
import { useAuth } from "../App";
import { getHabits } from "../api/api";

const SUGGESTIONS = [
  "How do I build a 30-day streak?",
  "Why do I keep breaking my habits?",
  "What's the best time to build habits?",
  "How many habits should I track?",
  "Tips for staying motivated?",
];

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{display:"flex",justifyContent:isUser?"flex-end":"flex-start",marginBottom:14,animation:"pageIn 0.3s ease both"}}>
      {!isUser && (
        <div style={{width:30,height:30,borderRadius:10,
          background:"linear-gradient(135deg,rgba(124,58,237,0.4),rgba(176,110,244,0.25))",
          border:"1px solid rgba(124,58,237,0.3)",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:14,flexShrink:0,marginRight:10,marginTop:2}}>
          🤖
        </div>
      )}
      <div style={{
        maxWidth:"78%",
        padding: isUser ? "10px 14px" : "12px 16px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
        background: isUser ? "rgba(124,58,237,0.22)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${isUser ? "rgba(124,58,237,0.32)" : "rgba(255,255,255,0.07)"}`,
        fontSize:14, lineHeight:1.65, whiteSpace:"pre-wrap",
      }}>
        {msg.content}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
      <div style={{width:30,height:30,borderRadius:10,
        background:"linear-gradient(135deg,rgba(124,58,237,0.4),rgba(176,110,244,0.25))",
        border:"1px solid rgba(124,58,237,0.3)",
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>
        🤖
      </div>
      <div style={{display:"flex",gap:5,padding:"10px 14px",
        background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",
        borderRadius:"4px 16px 16px 16px"}}>
        <style>{`@keyframes dot{0%,80%,100%{transform:scale(0.7);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>
        {[0,1,2].map(i => (
          <div key={i} style={{width:6,height:6,borderRadius:"50%",background:"var(--text-muted)",
            animation:`dot 1.2s ${i*0.2}s infinite`}} />
        ))}
      </div>
    </div>
  );
}

export default function AI() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([
    { role:"assistant", content:"Hey! I'm your AI habit coach powered by Gemini.\n\nI can help you build better habits, understand streak science, and stay consistent. What would you like to talk about?" }
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [habits,  setHabits]  = useState([]);
  const bottomRef = useRef();

  useEffect(() => {
    getHabits(token).then(setHabits).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const habitContext = habits.length
        ? `\n\nUser's current habits: ${habits.map(h => `${h.name} (${h.streak}-day streak)`).join(", ")}.`
        : "";

      const res = await fetch("http://localhost:8000/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role:    m.role,
            content: m.content,
          })),
          habit_context: habitContext,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed");
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);

    } catch (e) {
      setMessages(prev => [...prev, {
        role:    "assistant",
        content: "Sorry, something went wrong. Please try again.",
      }]);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        .ai-page {
          max-width:680px; margin:0 auto; padding:24px 20px 0;
          position:relative; z-index:1;
          display:flex; flex-direction:column;
          height:calc(100vh - 56px);
        }
        .ai-header { margin-bottom:16px; flex-shrink:0; }
        .chips { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; flex-shrink:0; }
        .chip {
          padding:6px 12px; border-radius:20px; font-size:12px;
          background:var(--bg-card); border:1px solid var(--border);
          color:var(--text-muted); cursor:pointer; font-family:var(--font);
          transition:all 0.18s;
        }
        .chip:hover { background:var(--bg-hover); border-color:var(--border-hi); color:var(--text); }
        .chat-body { flex:1; overflow-y:auto; padding:4px 0 16px; }
        .chat-bar {
          display:flex; gap:10px; align-items:flex-end;
          padding:12px 0 20px; flex-shrink:0;
          border-top:1px solid var(--border);
          background:rgba(8,7,14,0.95); backdrop-filter:blur(8px);
        }
        .chat-input {
          flex:1; min-height:44px; max-height:120px;
          padding:11px 14px; background:rgba(255,255,255,0.05);
          border:1px solid var(--border); border-radius:12px;
          color:var(--text); font-family:var(--font); font-size:14px;
          outline:none; resize:none; line-height:1.5;
          transition:border-color 0.2s;
        }
        .chat-input:focus { border-color:rgba(124,58,237,0.5); }
        .chat-input::placeholder { color:var(--text-dim); }
        .send-btn {
          width:44px; height:44px; border-radius:12px;
          background:var(--accent); border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:all 0.2s; flex-shrink:0;
        }
        .send-btn:hover:not(:disabled) { background:var(--accent-hi); transform:scale(1.05); }
        .send-btn:disabled { opacity:0.4; cursor:default; }
      `}</style>

      <div className="ai-page page-enter">

        {/* Header */}
        <div className="ai-header">
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:38,height:38,borderRadius:11,
              background:"linear-gradient(135deg,rgba(124,58,237,0.35),rgba(176,110,244,0.2))",
              border:"1px solid rgba(124,58,237,0.3)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
              🤖
            </div>
            <div>
              <div style={{fontSize:16,fontWeight:800,letterSpacing:"-0.02em"}}>AI Habit Coach</div>
              <div style={{fontSize:12,color:"var(--text-muted)"}}>
                Powered by Gemini · Knows your {habits.length} habits
              </div>
            </div>
          </div>
        </div>

        {/* Suggestion chips — only show at start */}
        {messages.length === 1 && (
          <div className="chips">
            {SUGGESTIONS.map(s => (
              <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}

        {/* Chat messages */}
        <div className="chat-body">
          {messages.map((m,i) => <Message key={i} msg={m} />)}
          {loading && <TypingDots />}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="chat-bar">
          <textarea className="chat-input"
            placeholder="Ask about habits, streaks, motivation…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
          />
          <button className="send-btn" onClick={() => send()} disabled={loading || !input.trim()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

      </div>
    </>
  );
}