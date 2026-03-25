// All backend calls live here — pages never call fetch() directly

const BASE = "http://localhost:8000";

async function request(path, options = {}, token = null) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res  = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
}

// ── Auth ──────────────────────────────────────
export const registerUser = (email, password) =>
  request("/register", { method: "POST", body: JSON.stringify({ email, password }) });

export const loginUser = async (email, password) => {
  const res  = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username: email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Login failed");
  return data;
};

// ── Habits ────────────────────────────────────
export const getHabits     = (token)           => request("/habits",                  {},                              token);
export const createHabit   = (token, habit)    => request("/habits",                  { method:"POST", body: JSON.stringify(habit) }, token);
export const updateHabit   = (token, id, data) => request(`/habits/${id}`,            { method:"PUT",  body: JSON.stringify(data)  }, token);
export const deleteHabit   = (token, id)       => request(`/habits/${id}`,            { method:"DELETE" },             token);
export const completeHabit = (token, id)       => request(`/habits/${id}/complete`,   { method:"POST" },               token);
export const sendContact = (data) => request("/contact", { method: "POST", body: JSON.stringify(data) });