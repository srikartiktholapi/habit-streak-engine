import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/api";

export default function Register() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const strengthPct = Math.min((password.length / 12) * 100, 100);
  const strengthColor = password.length < 4 ? "var(--red)" : password.length < 8 ? "var(--gold)" : "var(--green)";

  const submit = async () => {
    if (!email || !password)       { setError("Please fill in all fields."); return; }
    if (password !== confirm)       { setError("Passwords don't match."); return; }
    if (password.length < 6)        { setError("Password must be at least 6 characters."); return; }
    setError(""); setLoading(true);
    try {
      await registerUser(email, password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch(e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-box">

        <div className="auth-icon"
          style={{background:"linear-gradient(135deg,rgba(110,223,160,0.2),rgba(106,182,244,0.15))",
                  border:"1px solid rgba(110,223,160,0.25)"}}>
          🌱
        </div>

        <div className="auth-title">Create account</div>
        <div className="auth-sub">Start building habits that last</div>

        <div className="auth-field">
          <label className="field-label">EMAIL</label>
          <input className="field-input" type="email"
            placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="auth-field">
          <label className="field-label">PASSWORD</label>
          <input className="field-input" type="password"
            placeholder="Min. 6 characters"
            value={password} onChange={e => setPassword(e.target.value)} />
          {/* Password strength bar */}
          <div style={{height:3,borderRadius:2,background:"var(--border)",marginTop:6,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:2,width:`${strengthPct}%`,
              background:strengthColor,transition:"width 0.3s, background 0.3s"}} />
          </div>
        </div>

        <div className="auth-field">
          <label className="field-label">CONFIRM PASSWORD</label>
          <input className="field-input" type="password"
            placeholder="Repeat password"
            value={confirm} onChange={e => setConfirm(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            style={{borderColor: confirm && confirm !== password ? "rgba(244,116,106,0.4)" : ""}} />
        </div>

        {error   && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">✓ Account created! Redirecting to login…</div>}

        <button className="btn btn-primary"
          style={{width:"100%", padding:"11px", fontSize:14}}
          onClick={submit} disabled={loading || success}>
          {loading ? "Creating account..." : "Create account →"}
        </button>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>

      </div>
    </div>
  );
}