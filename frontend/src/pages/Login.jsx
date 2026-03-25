import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../App";
import { loginUser } from "../api/api";

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const submit = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError(""); setLoading(true);
    try {
      const data = await loginUser(email, password);
      login(data.access_token, { email });
      navigate("/dashboard");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-box">

        <div className="auth-icon"
          style={{background:"linear-gradient(135deg,rgba(124,58,237,0.3),rgba(176,110,244,0.2))",
                  border:"1px solid rgba(124,58,237,0.3)"}}>
          🔥
        </div>

        <div className="auth-title">Welcome back</div>
        <div className="auth-sub">Sign in to continue your streaks</div>

        <div className="auth-field">
          <label className="field-label">EMAIL</label>
          <input className="field-input" type="email"
            placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()} />
        </div>

        <div className="auth-field">
          <label className="field-label">PASSWORD</label>
          <input className="field-input" type="password"
            placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()} />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button className="btn btn-primary"
          style={{width:"100%", padding:"11px", fontSize:14, marginTop:4}}
          onClick={submit} disabled={loading}>
          {loading ? "Signing in..." : "Sign in →"}
        </button>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>

      </div>
    </div>
  );
}