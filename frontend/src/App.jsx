import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, createContext, useContext, useEffect } from "react";
import Navbar    from "./components/Navbar";
import Home      from "./pages/Home";
import Login     from "./pages/Login";
import Register  from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AI        from "./pages/AI";
import About     from "./pages/About";
import Contact   from "./pages/Contact";
import "./index.css";

export const AuthContext  = createContext(null);
export const ThemeContext = createContext(null);
export function useAuth()  { return useContext(AuthContext);  }
export function useTheme() { return useContext(ThemeContext); }

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("se_token") || null);
  const [user,  setUser]  = useState(() => JSON.parse(localStorage.getItem("se_user") || "null"));
  const [theme, setTheme] = useState(() => localStorage.getItem("se_theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("se_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  const login = (accessToken, userData) => {
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem("se_token", accessToken);
    localStorage.setItem("se_user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("se_token");
    localStorage.removeItem("se_user");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider value={{ token, user, login, logout }}>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/about"     element={<About />} />
            <Route path="/contact"   element={<Contact />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/register"  element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/ai"        element={<ProtectedRoute><AI /></ProtectedRoute>} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}