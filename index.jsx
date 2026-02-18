import { useState, useEffect } from "react";

//ehh dont look at this VV  
const ADMIN_USER = { username: "admin", password: "admin2026", role: "admin" };

const DEFAULT_LEVELS = [
  {
    id: 1,
    rank: 1,
    name: "Tartarus",
    creator: "Dolphy",
    difficulty: "Extreme Demon",
    points: 100,
    thumbnail: "https://i.ytimg.com/vi/gPNqMsNiZeA/maxresdefault.jpg",
    videoLink: "https://www.youtube.com/watch?v=gPNqMsNiZeA",
    victors: ["Dolphy", "xCoByC", "Trick"],
    description: "The hardest level in Geometry Dash history.",
    verifier: "Dolphy",
    song: "At the Speed of Light",
    id2: "62606666",
  },
  {
    id: 2,
    rank: 2,
    name: "Slaughterhouse",
    creator: "Icedcave",
    difficulty: "Extreme Demon",
    points: 97,
    thumbnail: "https://i.ytimg.com/vi/TpJZpC77kCk/maxresdefault.jpg",
    videoLink: "https://www.youtube.com/watch?v=TpJZpC77kCk",
    victors: ["Icedcave", "Aftermath"],
    description: "An incredibly precise and difficult extreme demon.",
    verifier: "Icedcave",
    song: "Slaughterhouse",
    id2: "75849282",
  },
  {
    id: 3,
    rank: 3,
    name: "Acheron",
    creator: "Xander",
    difficulty: "Extreme Demon",
    points: 94,
    thumbnail: "https://i.ytimg.com/vi/U9yWQkzXPXg/maxresdefault.jpg",
    videoLink: "https://www.youtube.com/watch?v=U9yWQkzXPXg",
    victors: ["Xander", "Zoink"],
    description: "A stunning and brutal extreme demon.",
    verifier: "Xander",
    song: "Acheron",
    id2: "81701134",
  },
];

const STORAGE_KEYS = { levels: "gdl_levels", users: "gdl_users", session: "gdl_session" };

async function storageGet(key) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function storageSet(key, value) {
  try { await window.storage.set(key, JSON.stringify(value)); } catch {}
}

const DIFFICULTIES = ["Easy Demon", "Medium Demon", "Hard Demon", "Insane Demon", "Extreme Demon"];

export default function App() {
  const [page, setPage] = useState("list"); // list, login, register, admin, levelDetail
  const [currentUser, setCurrentUser] = useState(null);
  const [levels, setLevels] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", password: "", confirm: "" });
  const [authError, setAuthError] = useState("");
  const [editingLevel, setEditingLevel] = useState(null);
  const [showAddLevel, setShowAddLevel] = useState(false);
  const [newLevel, setNewLevel] = useState({ name: "", creator: "", verifier: "", difficulty: "Extreme Demon", points: 0, thumbnail: "", videoLink: "", victors: [], description: "", song: "", id2: "" });
  const [victorInput, setVictorInput] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("levels"); // levels, leaderboard, users
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const savedLevels = await storageGet(STORAGE_KEYS.levels);
      const savedUsers = await storageGet(STORAGE_KEYS.users);
      const savedSession = await storageGet(STORAGE_KEYS.session);
      setLevels(savedLevels || DEFAULT_LEVELS);
      setUsers(savedUsers || []);
      if (savedSession) setCurrentUser(savedSession);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) storageSet(STORAGE_KEYS.levels, levels); }, [levels, loaded]);
  useEffect(() => { if (loaded) storageSet(STORAGE_KEYS.users, users); }, [users, loaded]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const login = () => {
    setAuthError("");
    const { username, password } = loginForm;
    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
      const user = { username, role: "admin" };
      setCurrentUser(user);
      storageSet(STORAGE_KEYS.session, user);
      showToast("Welcome back, Admin!");
      setPage("list");
      return;
    }
    const found = users.find(u => u.username === username && u.password === password);
    if (found) {
      const user = { username: found.username, role: "user" };
      setCurrentUser(user);
      storageSet(STORAGE_KEYS.session, user);
      showToast(`Welcome back, ${found.username}!`);
      setPage("list");
    } else {
      setAuthError("Invalid username or password.");
    }
  };

  const register = () => {
    setAuthError("");
    const { username, password, confirm } = registerForm;
    if (!username || !password) { setAuthError("All fields required."); return; }
    if (password !== confirm) { setAuthError("Passwords don't match."); return; }
    if (username === ADMIN_USER.username) { setAuthError("Username taken."); return; }
    if (users.find(u => u.username === username)) { setAuthError("Username already exists."); return; }
    const newUsers = [...users, { username, password, role: "user", joinedAt: Date.now() }];
    setUsers(newUsers);
    const user = { username, role: "user" };
    setCurrentUser(user);
    storageSet(STORAGE_KEYS.session, user);
    showToast(`Welcome, ${username}!`);
    setPage("list");
  };

  const logout = () => {
    setCurrentUser(null);
    storageSet(STORAGE_KEYS.session, null);
    showToast("Logged out.");
  };

  const saveLevel = (level) => {
    setLevels(prev => {
      const exists = prev.find(l => l.id === level.id);
      if (exists) return prev.map(l => l.id === level.id ? level : l).sort((a, b) => a.rank - b.rank);
      const newL = { ...level, id: Date.now() };
      return [...prev, newL].sort((a, b) => a.rank - b.rank);
    });
    setEditingLevel(null);
    setShowAddLevel(false);
    showToast("Level saved!");
  };

  const deleteLevel = (id) => {
    setLevels(prev => prev.filter(l => l.id !== id));
    if (selectedLevel?.id === id) { setSelectedLevel(null); setPage("list"); }
    showToast("Level deleted.", "error");
  };

  const deleteUser = (username) => {
    setUsers(prev => prev.filter(u => u.username !== username));
    showToast("User deleted.", "error");
  };

  const leaderboard = () => {
    const counts = {};
    levels.forEach(l => l.victors?.forEach(v => { counts[v] = (counts[v] || 0) + (l.points || 0); }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, pts], i) => ({ rank: i + 1, name, pts }));
  };

  const filtered = levels.filter(l => l.name?.toLowerCase().includes(searchQ.toLowerCase()) || l.creator?.toLowerCase().includes(searchQ.toLowerCase()));

  if (!loaded) return <div style={{ background: "#0a0a0f", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff6b35", fontFamily: "monospace", fontSize: 24 }}>Loading...</div>;

  return (
    <div style={{ fontFamily: "'Orbitron', 'Courier New', monospace", background: "#060610", minHeight: "100vh", color: "#e0e0ff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a1a; }
        ::-webkit-scrollbar-thumb { background: #ff6b35; border-radius: 3px; }
        body { margin: 0; }
        .gd-btn { 
          background: linear-gradient(135deg, #ff6b35, #ff4500); 
          border: none; color: #fff; padding: 10px 22px; 
          font-family: 'Orbitron', monospace; font-weight: 700; font-size: 12px; 
          cursor: pointer; clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          transition: all 0.2s; letter-spacing: 1px;
        }
        .gd-btn:hover { background: linear-gradient(135deg, #ff8c5a, #ff6b35); transform: translateY(-1px); }
        .gd-btn.blue { background: linear-gradient(135deg, #4488ff, #2266dd); }
        .gd-btn.blue:hover { background: linear-gradient(135deg, #66aaff, #4488ff); }
        .gd-btn.green { background: linear-gradient(135deg, #44ff88, #22cc66); color: #000; }
        .gd-btn.red { background: linear-gradient(135deg, #ff4444, #cc2222); }
        .gd-btn.sm { padding: 6px 14px; font-size: 10px; }
        .gd-input { 
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,107,53,0.3); 
          color: #e0e0ff; padding: 10px 14px; font-family: 'Rajdhani', monospace; font-size: 14px;
          width: 100%; outline: none; transition: border-color 0.2s;
        }
        .gd-input:focus { border-color: #ff6b35; background: rgba(255,107,53,0.05); }
        .gd-input select { background: #0a0a1a; }
        .level-card {
          background: linear-gradient(135deg, rgba(255,107,53,0.05), rgba(68,136,255,0.05));
          border: 1px solid rgba(255,107,53,0.15);
          border-left: 3px solid #ff6b35;
          padding: 0; cursor: pointer;
          transition: all 0.2s; position: relative; overflow: hidden;
        }
        .level-card:hover { border-color: rgba(255,107,53,0.5); background: rgba(255,107,53,0.08); transform: translateX(4px); }
        .nav-tab { 
          background: none; border: none; color: rgba(224,224,255,0.5); 
          font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 600;
          padding: 12px 20px; cursor: pointer; letter-spacing: 2px;
          border-bottom: 2px solid transparent; transition: all 0.2s;
        }
        .nav-tab.active { color: #ff6b35; border-bottom-color: #ff6b35; }
        .nav-tab:hover { color: #ff8c5a; }
        .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: #0d0d20; border: 1px solid rgba(255,107,53,0.3); max-width: 640px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 32px; position: relative; }
        .modal-title { font-size: 20px; font-weight: 900; color: #ff6b35; margin-bottom: 24px; letter-spacing: 3px; text-transform: uppercase; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 10px; letter-spacing: 2px; color: rgba(224,224,255,0.5); margin-bottom: 6px; font-weight: 600; }
        .rank-badge { 
          font-family: 'Orbitron', monospace; font-weight: 900; font-size: 18px;
          color: #ff6b35; min-width: 60px; text-align: center; padding: 0 16px;
          border-right: 1px solid rgba(255,107,53,0.2);
        }
        .diff-badge {
          font-size: 9px; letter-spacing: 1px; font-weight: 700; padding: 3px 8px;
          clip-path: polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%);
        }
        .toast { position: fixed; bottom: 24px; right: 24px; z-index: 9999; padding: 14px 24px; font-family: 'Orbitron', monospace; font-size: 12px; font-weight: 600; letter-spacing: 1px; animation: slideIn 0.3s ease; }
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .gd-header { background: linear-gradient(180deg, #000010, transparent); border-bottom: 1px solid rgba(255,107,53,0.2); }
        .star { position: absolute; background: white; border-radius: 50%; animation: twinkle 3s infinite; }
        @keyframes twinkle { 0%,100%{opacity:0.2} 50%{opacity:0.8} }
      `}</style>

      {/* Stars background */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="star" style={{ width: Math.random() * 2 + 1, height: Math.random() * 2 + 1, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${2 + Math.random() * 4}s` }} />
        ))}
      </div>

      {/* Header */}
      <header className="gd-header" style={{ position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }} onClick={() => setPage("list")}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #ff6b35, #ff4500)", clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⬡</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#ff6b35", letterSpacing: 3, lineHeight: 1 }}>GEOMETRY DASH</div>
              <div style={{ fontSize: 10, color: "rgba(224,224,255,0.5)", letterSpacing: 4 }}>DEMONLIST</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {currentUser ? (
              <>
                <span style={{ fontSize: 11, color: currentUser.role === "admin" ? "#ff6b35" : "rgba(224,224,255,0.6)", letterSpacing: 1 }}>
                  {currentUser.role === "admin" ? "⚡ " : ""}@{currentUser.username}
                </span>
                {currentUser.role === "admin" && <button className="gd-btn blue sm" onClick={() => setPage("admin")}>ADMIN</button>}
                <button className="gd-btn sm red" onClick={logout}>LOGOUT</button>
              </>
            ) : (
              <>
                <button className="gd-btn sm blue" onClick={() => { setAuthError(""); setPage("login"); }}>LOGIN</button>
                <button className="gd-btn sm" onClick={() => { setAuthError(""); setPage("register"); }}>REGISTER</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px", position: "relative", zIndex: 5 }}>

        {/* LIST PAGE */}
        {page === "list" && (
          <>
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <input className="gd-input" placeholder="🔍  Search levels or creators..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: 2 }}>
                {["list", "leaderboard"].map(t => (
                  <button key={t} className={`nav-tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                    {t === "list" ? "📋 DEMONLIST" : "🏆 LEADERBOARD"}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "list" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "rgba(224,224,255,0.4)", letterSpacing: 2 }}>{filtered.length} LEVELS</div>
                </div>
                {filtered.map(level => (
                  <div key={level.id} className="level-card" onClick={() => { setSelectedLevel(level); setPage("levelDetail"); }} style={{ display: "flex", alignItems: "center" }}>
                    {level.thumbnail && (
                      <div style={{ width: 80, height: 50, flexShrink: 0, overflow: "hidden" }}>
                        <img src={level.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} onError={e => e.target.style.display = "none"} />
                      </div>
                    )}
                    <div className="rank-badge">#{level.rank}</div>
                    <div style={{ flex: 1, padding: "12px 16px" }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", letterSpacing: 1 }}>{level.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(224,224,255,0.5)", marginTop: 2 }}>by {level.creator} • verified by {level.verifier}</div>
                    </div>
                    <div style={{ padding: "0 16px", textAlign: "right" }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "#44ff88" }}>{level.points}pt</div>
                      <div className="diff-badge" style={{ background: level.difficulty?.includes("Extreme") ? "rgba(255,68,68,0.2)" : level.difficulty?.includes("Insane") ? "rgba(255,107,53,0.2)" : "rgba(68,136,255,0.2)", color: level.difficulty?.includes("Extreme") ? "#ff4444" : level.difficulty?.includes("Insane") ? "#ff6b35" : "#4488ff" }}>
                        {level.difficulty}
                      </div>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && <div style={{ textAlign: "center", padding: 60, color: "rgba(224,224,255,0.3)", fontSize: 14, letterSpacing: 2 }}>NO LEVELS FOUND</div>}
              </div>
            )}

            {activeTab === "leaderboard" && (
              <div>
                <div style={{ background: "rgba(255,107,53,0.05)", border: "1px solid rgba(255,107,53,0.2)", padding: 20, marginBottom: 6 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 100px", gap: 16, fontSize: 10, letterSpacing: 2, color: "rgba(224,224,255,0.4)", fontWeight: 700 }}>
                    <span>RANK</span><span>PLAYER</span><span style={{ textAlign: "right" }}>POINTS</span>
                  </div>
                </div>
                {leaderboard().map(entry => (
                  <div key={entry.name} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderLeft: entry.rank <= 3 ? `3px solid ${["#ffd700","#c0c0c0","#cd7f32"][entry.rank-1]}` : "3px solid transparent", padding: 16, marginBottom: 4, display: "grid", gridTemplateColumns: "60px 1fr 100px", gap: 16, alignItems: "center" }}>
                    <span style={{ fontWeight: 900, color: entry.rank <= 3 ? ["#ffd700","#c0c0c0","#cd7f32"][entry.rank-1] : "rgba(224,224,255,0.5)", fontSize: 16 }}>#{entry.rank}</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{entry.name}</span>
                    <span style={{ textAlign: "right", color: "#44ff88", fontWeight: 700, fontSize: 16 }}>{entry.pts}</span>
                  </div>
                ))}
                {leaderboard().length === 0 && <div style={{ textAlign: "center", padding: 60, color: "rgba(224,224,255,0.3)", fontSize: 14, letterSpacing: 2 }}>NO DATA YET</div>}
              </div>
            )}
          </>
        )}

        {/* LEVEL DETAIL */}
        {page === "levelDetail" && selectedLevel && (
          <div>
            <button className="gd-btn sm blue" style={{ marginBottom: 20 }} onClick={() => setPage("list")}>← BACK</button>
            {selectedLevel.thumbnail && <div style={{ width: "100%", height: 280, overflow: "hidden", marginBottom: 24, position: "relative" }}>
              <img src={selectedLevel.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%, #060610)" }} />
              <div style={{ position: "absolute", bottom: 20, left: 24 }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", textShadow: "0 0 20px rgba(255,107,53,0.8)" }}>{selectedLevel.name}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>#{selectedLevel.rank} on the Demonlist</div>
              </div>
            </div>}
            {!selectedLevel.thumbnail && <h1 style={{ fontSize: 36, fontWeight: 900, color: "#ff6b35", marginBottom: 24 }}>#{selectedLevel.rank} — {selectedLevel.name}</h1>}
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
              <div style={{ background: "rgba(255,107,53,0.05)", border: "1px solid rgba(255,107,53,0.2)", padding: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(224,224,255,0.4)", marginBottom: 16, fontWeight: 700 }}>LEVEL INFO</div>
                {[["Creator", selectedLevel.creator], ["Verifier", selectedLevel.verifier], ["Difficulty", selectedLevel.difficulty], ["Points", selectedLevel.points + " pts"], ["Song", selectedLevel.song], ["Level ID", selectedLevel.id2]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 13 }}>
                    <span style={{ color: "rgba(224,224,255,0.5)" }}>{k}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(68,136,255,0.05)", border: "1px solid rgba(68,136,255,0.2)", padding: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(224,224,255,0.4)", marginBottom: 16, fontWeight: 700 }}>VICTORS ({selectedLevel.victors?.length || 0})</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {selectedLevel.victors?.map(v => (
                    <span key={v} style={{ background: "rgba(68,136,255,0.1)", border: "1px solid rgba(68,136,255,0.3)", padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>{v}</span>
                  ))}
                </div>
              </div>
            </div>
            {selectedLevel.description && <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: 20, marginBottom: 24, fontSize: 14, lineHeight: 1.7, color: "rgba(224,224,255,0.7)" }}>{selectedLevel.description}</div>}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {selectedLevel.videoLink && <a href={selectedLevel.videoLink} target="_blank" rel="noreferrer"><button className="gd-btn red">▶ WATCH VERIFICATION</button></a>}
              {currentUser?.role === "admin" && (
                <>
                  <button className="gd-btn blue" onClick={() => { setEditingLevel({ ...selectedLevel, victors: [...(selectedLevel.victors || [])] }); }}>✏ EDIT LEVEL</button>
                  <button className="gd-btn red" onClick={() => deleteLevel(selectedLevel.id)}>🗑 DELETE</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ADMIN PAGE */}
        {page === "admin" && currentUser?.role === "admin" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: "#ff6b35", letterSpacing: 3, margin: 0 }}>⚡ ADMIN PANEL</h2>
              <div style={{ display: "flex", gap: 8 }}>
                {["levels", "leaderboard", "users"].map(t => (
                  <button key={t} className={`nav-tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{t.toUpperCase()}</button>
                ))}
              </div>
            </div>

            {activeTab === "levels" && (
              <>
                <button className="gd-btn green" style={{ marginBottom: 20 }} onClick={() => { setNewLevel({ name: "", creator: "", verifier: "", difficulty: "Extreme Demon", points: 0, thumbnail: "", videoLink: "", victors: [], description: "", song: "", id2: "", rank: levels.length + 1 }); setVictorInput(""); setShowAddLevel(true); }}>+ ADD NEW LEVEL</button>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {levels.map(level => (
                    <div key={level.id} style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", padding: "12px 16px", gap: 16 }}>
                      <span style={{ color: "#ff6b35", fontWeight: 900, minWidth: 40 }}>#{level.rank}</span>
                      <span style={{ flex: 1, fontWeight: 600 }}>{level.name}</span>
                      <span style={{ fontSize: 12, color: "rgba(224,224,255,0.5)" }}>by {level.creator}</span>
                      <button className="gd-btn blue sm" onClick={() => { setEditingLevel({ ...level, victors: [...(level.victors || [])] }); setVictorInput(""); }}>EDIT</button>
                      <button className="gd-btn red sm" onClick={() => deleteLevel(level.id)}>DELETE</button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "leaderboard" && (
              <div>
                <div style={{ fontSize: 12, color: "rgba(224,224,255,0.5)", marginBottom: 20, letterSpacing: 1 }}>Leaderboard is auto-generated from victor completions across all levels.</div>
                {leaderboard().map(e => (
                  <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 4 }}>
                    <span style={{ fontWeight: 900, color: "#ff6b35", minWidth: 40 }}>#{e.rank}</span>
                    <span style={{ flex: 1, fontWeight: 600 }}>{e.name}</span>
                    <span style={{ color: "#44ff88", fontWeight: 700 }}>{e.pts} pts</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "users" && (
              <div>
                <div style={{ fontSize: 12, color: "rgba(224,224,255,0.5)", marginBottom: 20 }}>{users.length} registered users (admin account is hardcoded)</div>
                {users.map(u => (
                  <div key={u.username} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 4 }}>
                    <span style={{ flex: 1, fontWeight: 600 }}>@{u.username}</span>
                    <span style={{ fontSize: 11, color: "rgba(224,224,255,0.4)" }}>{new Date(u.joinedAt).toLocaleDateString()}</span>
                    <button className="gd-btn red sm" onClick={() => deleteUser(u.username)}>DELETE</button>
                  </div>
                ))}
                {users.length === 0 && <div style={{ color: "rgba(224,224,255,0.3)", fontSize: 14 }}>No registered users yet.</div>}
              </div>
            )}
          </div>
        )}

        {/* LOGIN / REGISTER */}
        {(page === "login" || page === "register") && (
          <div style={{ maxWidth: 420, margin: "60px auto" }}>
            <div style={{ background: "rgba(255,107,53,0.03)", border: "1px solid rgba(255,107,53,0.2)", padding: 40 }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#ff6b35", letterSpacing: 3, marginBottom: 4 }}>{page === "login" ? "LOGIN" : "REGISTER"}</div>
                <div style={{ fontSize: 11, color: "rgba(224,224,255,0.4)", letterSpacing: 2 }}>GEOMETRY DASH DEMONLIST</div>
              </div>
              {page === "login" ? (
                <>
                  <div className="form-group">
                    <label className="form-label">USERNAME</label>
                    <input className="gd-input" value={loginForm.username} onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))} placeholder="Enter username" onKeyDown={e => e.key === "Enter" && login()} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">PASSWORD</label>
                    <input className="gd-input" type="password" value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} placeholder="Enter password" onKeyDown={e => e.key === "Enter" && login()} />
                  </div>
                  {authError && <div style={{ color: "#ff4444", fontSize: 12, marginBottom: 16, letterSpacing: 1 }}>⚠ {authError}</div>}
                  <button className="gd-btn" style={{ width: "100%", justifyContent: "center", clipPath: "none" }} onClick={login}>LOGIN</button>
                  <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "rgba(224,224,255,0.4)" }}>
                    No account? <span style={{ color: "#ff6b35", cursor: "pointer" }} onClick={() => { setAuthError(""); setPage("register"); }}>Register here</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">USERNAME</label>
                    <input className="gd-input" value={registerForm.username} onChange={e => setRegisterForm(p => ({ ...p, username: e.target.value }))} placeholder="Choose a username" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">PASSWORD</label>
                    <input className="gd-input" type="password" value={registerForm.password} onChange={e => setRegisterForm(p => ({ ...p, password: e.target.value }))} placeholder="Choose a password" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CONFIRM PASSWORD</label>
                    <input className="gd-input" type="password" value={registerForm.confirm} onChange={e => setRegisterForm(p => ({ ...p, confirm: e.target.value }))} placeholder="Confirm password" onKeyDown={e => e.key === "Enter" && register()} />
                  </div>
                  {authError && <div style={{ color: "#ff4444", fontSize: 12, marginBottom: 16, letterSpacing: 1 }}>⚠ {authError}</div>}
                  <button className="gd-btn green" style={{ width: "100%", justifyContent: "center", clipPath: "none" }} onClick={register}>CREATE ACCOUNT</button>
                  <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "rgba(224,224,255,0.4)" }}>
                    Have an account? <span style={{ color: "#ff6b35", cursor: "pointer" }} onClick={() => { setAuthError(""); setPage("login"); }}>Login here</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* EDIT LEVEL MODAL */}
      {editingLevel && (
        <LevelEditModal
          level={editingLevel}
          victorInput={victorInput}
          setVictorInput={setVictorInput}
          onSave={saveLevel}
          onClose={() => setEditingLevel(null)}
        />
      )}

      {/* ADD LEVEL MODAL */}
      {showAddLevel && (
        <LevelEditModal
          level={newLevel}
          victorInput={victorInput}
          setVictorInput={setVictorInput}
          onSave={saveLevel}
          onClose={() => setShowAddLevel(false)}
          isNew
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="toast" style={{ background: toast.type === "error" ? "#cc2222" : "#22cc66", color: "#fff" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function LevelEditModal({ level, onSave, onClose, isNew, victorInput, setVictorInput }) {
  const [form, setForm] = useState({ ...level, victors: [...(level.victors || [])] });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addVictor = () => {
    if (victorInput.trim() && !form.victors.includes(victorInput.trim())) {
      setForm(p => ({ ...p, victors: [...p.victors, victorInput.trim()] }));
      setVictorInput("");
    }
  };

  const removeVictor = (v) => setForm(p => ({ ...p, victors: p.victors.filter(x => x !== v) }));

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{isNew ? "ADD NEW LEVEL" : `EDIT: ${level.name}`}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">LEVEL NAME</label>
            <input className="gd-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Level name" />
          </div>
          <div className="form-group">
            <label className="form-label">RANK</label>
            <input className="gd-input" type="number" value={form.rank} onChange={e => set("rank", +e.target.value)} min={1} />
          </div>
          <div className="form-group">
            <label className="form-label">CREATOR</label>
            <input className="gd-input" value={form.creator} onChange={e => set("creator", e.target.value)} placeholder="Creator name" />
          </div>
          <div className="form-group">
            <label className="form-label">VERIFIER</label>
            <input className="gd-input" value={form.verifier} onChange={e => set("verifier", e.target.value)} placeholder="Verifier name" />
          </div>
          <div className="form-group">
            <label className="form-label">DIFFICULTY</label>
            <select className="gd-input" value={form.difficulty} onChange={e => set("difficulty", e.target.value)} style={{ background: "#0a0a1a" }}>
              {["Easy Demon","Medium Demon","Hard Demon","Insane Demon","Extreme Demon"].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">POINTS</label>
            <input className="gd-input" type="number" value={form.points} onChange={e => set("points", +e.target.value)} min={0} max={100} />
          </div>
          <div className="form-group">
            <label className="form-label">SONG</label>
            <input className="gd-input" value={form.song} onChange={e => set("song", e.target.value)} placeholder="Song name" />
          </div>
          <div className="form-group">
            <label className="form-label">LEVEL ID</label>
            <input className="gd-input" value={form.id2} onChange={e => set("id2", e.target.value)} placeholder="GD Level ID" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">THUMBNAIL URL</label>
          <input className="gd-input" value={form.thumbnail} onChange={e => set("thumbnail", e.target.value)} placeholder="https://..." />
        </div>
        <div className="form-group">
          <label className="form-label">VIDEO LINK</label>
          <input className="gd-input" value={form.videoLink} onChange={e => set("videoLink", e.target.value)} placeholder="https://youtube.com/..." />
        </div>
        <div className="form-group">
          <label className="form-label">DESCRIPTION</label>
          <textarea className="gd-input" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Level description..." rows={3} style={{ resize: "vertical" }} />
        </div>
        <div className="form-group">
          <label className="form-label">VICTORS</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input className="gd-input" style={{ flex: 1 }} value={victorInput} onChange={e => setVictorInput(e.target.value)} placeholder="Add victor..." onKeyDown={e => e.key === "Enter" && addVictor()} />
            <button className="gd-btn sm green" style={{ clipPath: "none", whiteSpace: "nowrap" }} onClick={addVictor}>ADD</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {form.victors.map(v => (
              <span key={v} style={{ background: "rgba(68,136,255,0.1)", border: "1px solid rgba(68,136,255,0.3)", padding: "4px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
                {v}
                <span style={{ cursor: "pointer", color: "#ff4444" }} onClick={() => removeVictor(v)}>×</span>
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button className="gd-btn green" onClick={() => onSave(form)}>💾 SAVE LEVEL</button>
          <button className="gd-btn red" onClick={onClose}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}
