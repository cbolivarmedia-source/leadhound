import { useState, useEffect, useMemo } from "react";

const BIRD_DOGS = [
  { id: 1, name: "Marcus Johnson", phone: "(555) 234-5678", rate: 150 },
  { id: 2, name: "Tina Reyes", phone: "(555) 876-2211", rate: 200 },
  { id: 3, name: "Dwayne Carter", phone: "(555) 443-9102", rate: 100 },
];

const LEADS = [
  { id: 1, name: "James Williams", phone: "(555) 111-2233", birdDogId: 1, status: "sold", date: "2026-02-07", notes: "2018 Altima, funded", paidOut: true, amount: 150 },
  { id: 2, name: "Keisha Brown", phone: "(555) 222-3344", birdDogId: 1, status: "contacted", date: "2026-02-08", notes: "Needs SUV, has $1500 down", paidOut: false, amount: 150 },
  { id: 3, name: "Roberto Mendes", phone: "(555) 333-4455", birdDogId: 2, status: "showed", date: "2026-02-06", notes: "Screenshot - paystubs uploaded", paidOut: false, amount: 200 },
  { id: 4, name: "Lisa Chang", phone: "(555) 444-5566", birdDogId: 2, status: "sold", date: "2026-02-05", notes: "2019 Civic, funded", paidOut: true, amount: 200 },
  { id: 5, name: "Andre Thomas", phone: "(555) 555-6677", birdDogId: 3, status: "new", date: "2026-02-09", notes: "Text lead - name and number only", paidOut: false, amount: 100 },
  { id: 6, name: "Maria Gonzalez", phone: "(555) 666-7788", birdDogId: 1, status: "sold", date: "2026-02-03", notes: "2020 Sentra, funded", paidOut: true, amount: 150 },
  { id: 7, name: "DeShawn Harris", phone: "(555) 777-8899", birdDogId: 2, status: "lost", date: "2026-01-28", notes: "No show x3", paidOut: false, amount: 200 },
  { id: 8, name: "Tameka Wilson", phone: "(555) 888-9900", birdDogId: 1, status: "sold", date: "2026-01-30", notes: "2017 Malibu, funded", paidOut: false, amount: 150 },
];

const STATUS_CONFIG = {
  new: { label: "New", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  contacted: { label: "Contacted", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  showed: { label: "Showed", color: "#a855f7", bg: "rgba(168,85,247,0.12)" },
  sold: { label: "Sold", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  lost: { label: "Lost", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

const STATUSES = ["new", "contacted", "showed", "sold", "lost"];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const getCurrentMonth = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };
const formatMonthLabel = (ym) => { const [y, m] = ym.split("-"); return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`; };
const shiftMonth = (ym, delta) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const leadMatchesMonth = (leadDate, ym) => leadDate.startsWith(ym);

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Space+Mono:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  @keyframes scanLine {
    0% { transform: translateY(0); opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { transform: translateY(180px); opacity: 0; }
  }
`;

/* âââââââââââââââââââââââââââââââââââââââââââââ
   LOGIN SCREEN
   âââââââââââââââââââââââââââââââââââââââââââââ */
const ADMIN_PASSCODE = "1234"; // Change this to your own passcode

function LoginScreen({ birdDogs, onLogin }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [matchedBD, setMatchedBD] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminVerified, setAdminVerified] = useState(false);

  // Format phone as user types: (555) 123-4567
  const formatPhone = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits.length ? `(${digits}` : "";
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setPhoneInput(formatted);
    setPhoneError("");
    setMatchedBD(null);
  };

  const handleVerify = () => {
    setVerifying(true);
    setPhoneError("");
    // Simulate a short verification delay
    setTimeout(() => {
      const digits = phoneInput.replace(/\D/g, "");
      const found = birdDogs.find(bd => bd.phone.replace(/\D/g, "") === digits);
      if (found) {
        setMatchedBD(found);
        setPhoneError("");
      } else {
        setMatchedBD(null);
        setPhoneError("No account found with this number. Contact your salesperson to get added to LeadHound.");
      }
      setVerifying(false);
    }, 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && phoneInput.replace(/\D/g, "").length === 10) {
      handleVerify();
    }
  };

  const phoneDigits = phoneInput.replace(/\D/g, "").length;
  const canVerify = phoneDigits === 10 && !verifying;
  const canProceed = (selectedRole === "admin" && adminVerified) || (selectedRole === "referrer" && matchedBD);

  const handleAdminVerify = () => {
    if (adminCode === ADMIN_PASSCODE) {
      setAdminVerified(true);
      setAdminError("");
    } else {
      setAdminVerified(false);
      setAdminError("Incorrect passcode. Try again.");
    }
  };

  const handleAdminKeyDown = (e) => {
    if (e.key === "Enter" && adminCode.length >= 4) {
      handleAdminVerify();
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #0a0a0f 0%, #111118 50%, #0d0d14 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: "#e8e8ed",
    }}>
      <style>{GLOBAL_STYLES}</style>
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20, padding: "48px 36px", width: "100%", maxWidth: 440,
        animation: "fadeUp 0.4s ease",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{
            width: 52, height: 52,
            background: "linear-gradient(135deg, #f59e0b, #ef4444)",
            borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: "#fff", letterSpacing: -1,
          }}>LH</div>
        </div>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>LeadHound</div>
          <div style={{ fontSize: 12, color: "#555", fontFamily: "'Space Mono', monospace", marginTop: 6, letterSpacing: "0.05em" }}>SELECT YOUR ROLE</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          <button onClick={() => { setSelectedRole("admin"); setPhoneInput(""); setPhoneError(""); setMatchedBD(null); setAdminCode(""); setAdminError(""); setAdminVerified(false); }} style={{
            padding: "18px 20px", borderRadius: 12, cursor: "pointer", textAlign: "left",
            fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
            border: selectedRole === "admin" ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.06)",
            background: selectedRole === "admin" ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.02)",
            color: "#e8e8ed",
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: selectedRole === "admin" ? "#f59e0b" : "#e8e8ed" }}>Salesperson / Admin</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>Full access â all leads, all hounds, manage payouts</div>
          </button>

          <button onClick={() => { setSelectedRole("referrer"); setMatchedBD(null); setAdminCode(""); setAdminError(""); setAdminVerified(false); }} style={{
            padding: "18px 20px", borderRadius: 12, cursor: "pointer", textAlign: "left",
            fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
            border: selectedRole === "referrer" ? "1px solid rgba(168,85,247,0.4)" : "1px solid rgba(255,255,255,0.06)",
            background: selectedRole === "referrer" ? "rgba(168,85,247,0.08)" : "rgba(255,255,255,0.02)",
            color: "#e8e8ed",
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: selectedRole === "referrer" ? "#a855f7" : "#e8e8ed" }}>Lead Provider / Hound</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>Verify with your phone number to view your leads</div>
          </button>
        </div>

        {/* Admin passcode */}
        {selectedRole === "admin" && (
          <div style={{ marginBottom: 24, animation: "fadeUp 0.25s ease" }}>
            <label style={{ fontSize: 11, color: "#666", display: "block", marginBottom: 6, fontFamily: "'Space Mono', monospace", letterSpacing: "0.04em" }}>ENTER ADMIN PASSCODE</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={adminCode}
                onChange={e => { setAdminCode(e.target.value); setAdminError(""); setAdminVerified(false); }}
                onKeyDown={handleAdminKeyDown}
                placeholder="â¢â¢â¢â¢"
                type="password"
                style={{
                  flex: 1, padding: "11px 14px", borderRadius: 10,
                  border: adminError ? "1px solid rgba(239,68,68,0.4)" : adminVerified ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.08)",
                  background: adminError ? "rgba(239,68,68,0.06)" : adminVerified ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.03)",
                  color: "#e8e8ed", fontSize: 18, fontFamily: "'Space Mono', monospace",
                  outline: "none", letterSpacing: "0.15em", textAlign: "center",
                }}
                autoFocus
              />
              <button
                disabled={adminCode.length < 4 || adminVerified}
                onClick={handleAdminVerify}
                style={{
                  padding: "11px 18px", borderRadius: 10, border: "none",
                  background: adminCode.length >= 4 && !adminVerified ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.04)",
                  color: adminCode.length >= 4 && !adminVerified ? "#f59e0b" : "#444",
                  fontSize: 13, fontWeight: 600, cursor: adminCode.length >= 4 && !adminVerified ? "pointer" : "default",
                  fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", whiteSpace: "nowrap",
                }}
              >
                {adminVerified ? "â" : "Unlock"}
              </button>
            </div>

            {adminError && (
              <div style={{
                marginTop: 10, padding: "10px 14px", borderRadius: 8,
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                fontSize: 12, color: "#ef4444", lineHeight: 1.4,
                animation: "fadeUp 0.2s ease",
              }}>
                {adminError}
              </div>
            )}

            {adminVerified && (
              <div style={{
                marginTop: 10, padding: "12px 14px", borderRadius: 10,
                background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)",
                animation: "fadeUp 0.2s ease",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: 4, background: "#10b981",
                    boxShadow: "0 0 6px rgba(16,185,129,0.5)",
                  }} />
                  <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600, fontFamily: "'Space Mono', monospace" }}>UNLOCKED</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e8ed", marginTop: 4 }}>Admin access granted</div>
              </div>
            )}
          </div>
        )}

        {/* Phone verification for referrers */}
        {selectedRole === "referrer" && (
          <div style={{ marginBottom: 24, animation: "fadeUp 0.25s ease" }}>
            <label style={{ fontSize: 11, color: "#666", display: "block", marginBottom: 6, fontFamily: "'Space Mono', monospace", letterSpacing: "0.04em" }}>ENTER YOUR PHONE NUMBER</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={phoneInput}
                onChange={handlePhoneChange}
                onKeyDown={handleKeyDown}
                placeholder="(555) 000-0000"
                style={{
                  flex: 1, padding: "11px 14px", borderRadius: 10,
                  border: phoneError ? "1px solid rgba(239,68,68,0.4)" : matchedBD ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.08)",
                  background: phoneError ? "rgba(239,68,68,0.06)" : matchedBD ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.03)",
                  color: "#e8e8ed", fontSize: 15, fontFamily: "'Space Mono', monospace",
                  outline: "none", letterSpacing: "0.02em",
                }}
                autoFocus
              />
              <button
                disabled={!canVerify}
                onClick={handleVerify}
                style={{
                  padding: "11px 18px", borderRadius: 10, border: "none",
                  background: canVerify ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.04)",
                  color: canVerify ? "#a855f7" : "#444",
                  fontSize: 13, fontWeight: 600, cursor: canVerify ? "pointer" : "default",
                  fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", whiteSpace: "nowrap",
                }}
              >
                {verifying ? "..." : "Verify"}
              </button>
            </div>

            {/* Error message */}
            {phoneError && (
              <div style={{
                marginTop: 10, padding: "10px 14px", borderRadius: 8,
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                fontSize: 12, color: "#ef4444", lineHeight: 1.4,
                animation: "fadeUp 0.2s ease",
              }}>
                {phoneError}
              </div>
            )}

            {/* Verified match */}
            {matchedBD && (
              <div style={{
                marginTop: 10, padding: "12px 14px", borderRadius: 10,
                background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)",
                animation: "fadeUp 0.2s ease",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: 4, background: "#10b981",
                    boxShadow: "0 0 6px rgba(16,185,129,0.5)",
                  }} />
                  <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600, fontFamily: "'Space Mono', monospace" }}>VERIFIED</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#e8e8ed" }}>Welcome back, {matchedBD.name}!</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 3 }}>{matchedBD.phone}</div>
              </div>
            )}
          </div>
        )}

        <button
          disabled={!canProceed}
          onClick={() => onLogin(selectedRole, selectedRole === "referrer" ? matchedBD.id : null)}
          style={{
            width: "100%", padding: "14px 20px", borderRadius: 12, border: "none",
            background: !canProceed
              ? "rgba(255,255,255,0.06)"
              : "linear-gradient(135deg, #f59e0b, #ef4444)",
            color: !canProceed ? "#555" : "#fff",
            fontSize: 15, fontWeight: 600, cursor: canProceed ? "pointer" : "default",
            fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
          }}
        >
          {selectedRole === "referrer" && matchedBD ? `Continue as ${matchedBD.name}` : selectedRole === "admin" ? "Open Dashboard" : "Continue"}
        </button>
      </div>
    </div>
  );
}

/* âââââââââââââââââââââââââââââââââââââââââââââ
   REFERRER PORTAL (hound's limited view)
   âââââââââââââââââââââââââââââââââââââââââââââ */
function ReferrerPortal({ birdDog, leads, onLogout }) {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const myLeads = useMemo(() => leads.filter(l => l.birdDogId === birdDog.id && leadMatchesMonth(l.date, selectedMonth)), [leads, birdDog.id, selectedMonth]);

  const stats = useMemo(() => {
    const total = myLeads.length;
    const sold = myLeads.filter(l => l.status === "sold").length;
    const paidOut = myLeads.filter(l => l.paidOut).reduce((s, l) => s + l.amount, 0);
    const owed = myLeads.filter(l => l.status === "sold" && !l.paidOut).reduce((s, l) => s + l.amount, 0);
    const rate = total > 0 ? ((sold / total) * 100).toFixed(0) : 0;
    return { total, sold, paidOut, owed, rate };
  }, [myLeads]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = myLeads.filter(l => {
    const statusMatch = filterStatus === "all" || l.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const searchMatch = !q || l.name.toLowerCase().includes(q) || l.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "")) || l.phone.includes(q);
    return statusMatch && searchMatch;
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #0a0a0f 0%, #111118 50%, #0d0d14 100%)",
      color: "#e8e8ed", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    }}>
      <style>{GLOBAL_STYLES}</style>

      {/* Header */}
      <div style={{
        padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        backdropFilter: "blur(20px)", background: "rgba(10,10,15,0.8)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 38, height: 38,
            background: "linear-gradient(135deg, #a855f7, #7c3aed)",
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: "#fff", letterSpacing: -1,
          }}>LH</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em" }}>My Referrals</div>
            <div style={{ fontSize: 11, color: "#666", fontFamily: "'Space Mono', monospace", letterSpacing: "0.05em" }}>
              {birdDog.name.toUpperCase()}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
            background: "rgba(245,158,11,0.12)", color: "#f59e0b",
            fontFamily: "'Space Mono', monospace",
          }}>${birdDog.rate}/LEAD</span>
          <span style={{
            padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
            background: "rgba(168,85,247,0.12)", color: "#a855f7",
            fontFamily: "'Space Mono', monospace",
          }}>LEAD PROVIDER</span>
          <button onClick={onLogout} style={{
            padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent", color: "#777", fontSize: 13, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}>Sign Out</button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px" }}>
        {/* ââ Month Picker ââ */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
          marginBottom: 24, animation: "fadeUp 0.3s ease",
        }}>
          <button onClick={() => setSelectedMonth(shiftMonth(selectedMonth, -1))} style={{
            width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)", color: "#888", fontSize: 16, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,85,247,0.1)"; e.currentTarget.style.color = "#a855f7"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "#888"; }}
          >â</button>
          <div style={{ minWidth: 180, textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>{formatMonthLabel(selectedMonth)}</div>
            {selectedMonth === getCurrentMonth() && (
              <div style={{ fontSize: 10, color: "#a855f7", fontFamily: "'Space Mono', monospace", marginTop: 3, letterSpacing: "0.06em" }}>CURRENT MONTH</div>
            )}
          </div>
          <button onClick={() => setSelectedMonth(shiftMonth(selectedMonth, 1))} style={{
            width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(255,255,255,0.08)",
            background: selectedMonth === getCurrentMonth() ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.03)",
            color: selectedMonth === getCurrentMonth() ? "#333" : "#888", fontSize: 16,
            cursor: selectedMonth === getCurrentMonth() ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
          }}
            disabled={selectedMonth === getCurrentMonth()}
            onMouseEnter={e => { if (selectedMonth !== getCurrentMonth()) { e.currentTarget.style.background = "rgba(168,85,247,0.1)"; e.currentTarget.style.color = "#a855f7"; } }}
            onMouseLeave={e => { e.currentTarget.style.background = selectedMonth === getCurrentMonth() ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.03)"; e.currentTarget.style.color = selectedMonth === getCurrentMonth() ? "#333" : "#888"; }}
          >â</button>
          {selectedMonth !== getCurrentMonth() && (
            <button onClick={() => setSelectedMonth(getCurrentMonth())} style={{
              padding: "5px 12px", borderRadius: 7, border: "none",
              background: "rgba(168,85,247,0.12)", color: "#a855f7",
              fontSize: 11, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Space Mono', monospace", transition: "all 0.2s",
            }}>TODAY</button>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28, animation: "fadeUp 0.4s ease" }}>
          {[
            { label: "My Leads", value: stats.total, accent: "#3b82f6" },
            { label: "Sold", value: stats.sold, accent: "#10b981" },
            { label: "Earned", value: `$${stats.paidOut}`, accent: "#a855f7" },
            { label: "Owed to Me", value: `$${stats.owed}`, accent: stats.owed > 0 ? "#f59e0b" : "#444" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: "20px 18px",
              animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
            }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 8, fontFamily: "'Space Mono', monospace", letterSpacing: "0.04em" }}>{s.label.toUpperCase()}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.accent, letterSpacing: "-0.03em", lineHeight: 1, fontFamily: "'Space Mono', monospace" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search your leads by name or phone..."
            style={{
              width: "100%", padding: "11px 14px 11px 40px", borderRadius: 10,
              border: searchQuery ? "1px solid rgba(168,85,247,0.3)" : "1px solid rgba(255,255,255,0.08)",
              background: searchQuery ? "rgba(168,85,247,0.04)" : "rgba(255,255,255,0.03)",
              color: "#e8e8ed", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none",
              transition: "all 0.2s",
            }}
          />
          <span style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            fontSize: 15, color: searchQuery ? "#a855f7" : "#555", pointerEvents: "none",
          }}>â</span>
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.08)", border: "none", color: "#999",
              width: 22, height: 22, borderRadius: 6, fontSize: 12, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>Ã</button>
          )}
        </div>

        {/* Status Filter */}
        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          <button onClick={() => setFilterStatus("all")} style={{
            padding: "5px 14px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.08)",
            background: filterStatus === "all" ? "rgba(255,255,255,0.08)" : "transparent",
            color: filterStatus === "all" ? "#e8e8ed" : "#666",
            fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>All</button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: "5px 14px", borderRadius: 7,
              border: `1px solid ${filterStatus === s ? STATUS_CONFIG[s].color + "44" : "rgba(255,255,255,0.06)"}`,
              background: filterStatus === s ? STATUS_CONFIG[s].bg : "transparent",
              color: filterStatus === s ? STATUS_CONFIG[s].color : "#666",
              fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textTransform: "capitalize",
            }}>{STATUS_CONFIG[s].label}</button>
          ))}
        </div>

        {searchQuery && (
          <div style={{ fontSize: 12, color: "#666", marginBottom: 12, fontFamily: "'Space Mono', monospace" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{searchQuery}"
          </div>
        )}

        {/* Lead Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 && (
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, padding: 40, textAlign: "center", color: "#555",
            }}>No leads match this filter.</div>
          )}
          {filtered.map((lead, i) => (
            <div key={lead.id} style={{
              background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, padding: "16px 20px",
              display: "grid", gridTemplateColumns: "1.3fr 1fr 0.5fr 0.5fr",
              alignItems: "center", gap: 12,
              animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
              transition: "background 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{lead.name}</div>
                <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{lead.phone}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#444" }}>{lead.notes}</div>
                <div style={{ fontSize: 11, color: "#333", marginTop: 2, fontFamily: "'Space Mono', monospace" }}>{lead.date}</div>
              </div>
              <div>
                <span style={{
                  padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                  color: STATUS_CONFIG[lead.status].color, background: STATUS_CONFIG[lead.status].bg,
                  fontFamily: "'Space Mono', monospace",
                }}>{STATUS_CONFIG[lead.status].label}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                {lead.status === "sold" && (
                  <span style={{
                    padding: "5px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                    color: lead.paidOut ? "#10b981" : "#f59e0b",
                    background: lead.paidOut ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                    fontFamily: "'Space Mono', monospace",
                  }}>{lead.paidOut ? "Paid $" + lead.amount : "Pending $" + lead.amount}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* âââââââââââââââââââââââââââââââââââââââââââââ
   ADMIN DASHBOARD (salesperson full view â LeadHound)
   âââââââââââââââââââââââââââââââââââââââââââââ */
function AdminDashboard({ leads, setLeads, birdDogs, setBirdDogs, onLogout }) {
  const [view, setView] = useState("dashboard");
  const [selectedBirdDog, setSelectedBirdDog] = useState(null);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showAddBirdDog, setShowAddBirdDog] = useState(false);
  const [newLead, setNewLead] = useState({ name: "", phone: "", birdDogId: "", notes: "", source: "text" });
  const [newBirdDog, setNewBirdDog] = useState({ name: "", phone: "", rate: "" });
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [imagePreview, setImagePreview] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extractResult, setExtractResult] = useState(null);

  // AI extraction: reads image via OCR-style canvas text extraction + pattern matching
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      setExtracting(true);
      setExtractResult(null);
      // Simulate AI processing with a realistic delay, then run extraction
      setTimeout(() => runExtraction(ev.target.result, file), 1800);
    };
    reader.readAsDataURL(file);
  };

  const runExtraction = (dataUrl, file) => {
    // Create a canvas to read pixel data and attempt text extraction
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      // In a real app, this would call an AI vision API (GPT-4V, Claude, etc.)
      // For this demo, we simulate smart extraction based on common lead screenshot patterns
      const extracted = simulateAIExtraction(file.name);

      setNewLead(prev => ({
        ...prev,
        name: extracted.name || prev.name,
        phone: extracted.phone || prev.phone,
        notes: extracted.notes || prev.notes,
        source: "screenshot",
      }));
      setExtractResult(extracted);
      setExtracting(false);
    };
    img.src = dataUrl;
  };

  // Simulated AI extraction â in production, replace with actual vision API call
  const simulateAIExtraction = (filename) => {
    // Simulate different extraction results based on randomness to show the feature working
    const samples = [
      { name: "Tyrone Jackson", phone: "(555) 912-3344", notes: "Screenshot: Interested in SUV, $2000 down, works at FedEx", confidence: 94 },
      { name: "Brianna Lopez", phone: "(555) 718-5502", notes: "Screenshot: Needs reliable car for work, has trade-in 2015 Camry", confidence: 88 },
      { name: "Dante Williams", phone: "(555) 404-6789", notes: "Screenshot: Looking for truck, pre-approved at credit union", confidence: 91 },
      { name: "Jasmine Rivera", phone: "(555) 301-2288", notes: "Screenshot: First time buyer, co-signer available, budget $15k", confidence: 86 },
    ];
    return samples[Math.floor(Math.random() * samples.length)];
  };

  const clearImage = () => {
    setImagePreview(null);
    setExtractResult(null);
    setExtracting(false);
  };

  // Month-scoped leads â everything below uses this instead of raw `leads`
  const monthLeads = useMemo(() => leads.filter(l => leadMatchesMonth(l.date, selectedMonth)), [leads, selectedMonth]);

  const totalLeads = monthLeads.length;
  const totalSold = monthLeads.filter(l => l.status === "sold").length;
  const totalOwed = monthLeads.filter(l => l.status === "sold" && !l.paidOut).reduce((s, l) => s + l.amount, 0);
  const totalPaid = monthLeads.filter(l => l.paidOut).reduce((s, l) => s + l.amount, 0);
  const conversionRate = totalLeads > 0 ? ((totalSold / totalLeads) * 100).toFixed(0) : 0;

  const filteredLeads = monthLeads.filter(l => {
    const statusMatch = filterStatus === "all" || l.status === filterStatus;
    const bdMatch = selectedBirdDog ? l.birdDogId === selectedBirdDog : true;
    const q = searchQuery.toLowerCase().trim();
    const searchMatch = !q || l.name.toLowerCase().includes(q) || l.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "")) || l.phone.includes(q);
    return statusMatch && bdMatch && searchMatch;
  });

  const handleAddLead = () => {
    if (!newLead.name || !newLead.birdDogId) return;
    const bd = birdDogs.find(b => b.id === parseInt(newLead.birdDogId));
    const lead = {
      id: leads.length + 1, name: newLead.name, phone: newLead.phone,
      birdDogId: parseInt(newLead.birdDogId), status: "new",
      date: new Date().toISOString().split("T")[0],
      notes: newLead.notes || (newLead.source === "screenshot" ? "Screenshot lead" : "Text lead"),
      paidOut: false, amount: bd?.rate || 150,
    };
    setLeads([lead, ...leads]);
    setNewLead({ name: "", phone: "", birdDogId: "", notes: "", source: "text" });
    setImagePreview(null);
    setExtractResult(null);
    setShowAddLead(false);
  };

  const handleAddBirdDog = () => {
    if (!newBirdDog.name) return;
    setBirdDogs([...birdDogs, { id: birdDogs.length + 1, name: newBirdDog.name, phone: newBirdDog.phone, rate: parseFloat(newBirdDog.rate) || 150 }]);
    setNewBirdDog({ name: "", phone: "", rate: "" });
    setShowAddBirdDog(false);
  };

  const cycleStatus = (leadId) => {
    setLeads(leads.map(l => {
      if (l.id !== leadId) return l;
      const idx = STATUSES.indexOf(l.status);
      return { ...l, status: STATUSES[(idx + 1) % STATUSES.length] };
    }));
  };

  const togglePaid = (leadId) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, paidOut: !l.paidOut } : l));
  };

  const getBirdDogName = (id) => birdDogs.find(b => b.id === id)?.name || "Unknown";

  const getBirdDogStats = (bdId) => {
    const bdLeads = monthLeads.filter(l => l.birdDogId === bdId);
    return {
      total: bdLeads.length,
      sold: bdLeads.filter(l => l.status === "sold").length,
      owed: bdLeads.filter(l => l.status === "sold" && !l.paidOut).reduce((s, l) => s + l.amount, 0),
      paid: bdLeads.filter(l => l.paidOut).reduce((s, l) => s + l.amount, 0),
    };
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #0a0a0f 0%, #111118 50%, #0d0d14 100%)",
      color: "#e8e8ed", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", overflow: "hidden",
    }}>
      <style>{GLOBAL_STYLES}</style>

      {/* Header */}
      <div style={{
        padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        backdropFilter: "blur(20px)", background: "rgba(10,10,15,0.8)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 38, height: 38,
            background: "linear-gradient(135deg, #f59e0b, #ef4444)",
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: "#fff", letterSpacing: -1,
          }}>LH</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em" }}>LeadHound</div>
            <div style={{ fontSize: 11, color: "#666", fontFamily: "'Space Mono', monospace", letterSpacing: "0.05em" }}>LEAD MANAGEMENT</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {["dashboard", "leads", "hounds", "payouts"].map(v => (
            <button key={v} onClick={() => { setView(v); setSelectedBirdDog(null); }} style={{
              padding: "7px 16px", borderRadius: 8, border: "none",
              background: view === v ? "rgba(245,158,11,0.15)" : "transparent",
              color: view === v ? "#f59e0b" : "#777", fontSize: 13, fontWeight: 500,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textTransform: "capitalize", transition: "all 0.2s",
            }}>{v}</button>
          ))}
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.08)", margin: "0 6px" }} />
          <button onClick={onLogout} style={{
            padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent", color: "#777", fontSize: 12, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}>Sign Out</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

        {/* ââ Month Picker ââ */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
          marginBottom: 24, animation: "fadeUp 0.3s ease",
        }}>
          <button onClick={() => setSelectedMonth(shiftMonth(selectedMonth, -1))} style={{
            width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)", color: "#888", fontSize: 16, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,158,11,0.1)"; e.currentTarget.style.color = "#f59e0b"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "#888"; }}
          >â</button>
          <div style={{ minWidth: 180, textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>{formatMonthLabel(selectedMonth)}</div>
            {selectedMonth === getCurrentMonth() && (
              <div style={{ fontSize: 10, color: "#f59e0b", fontFamily: "'Space Mono', monospace", marginTop: 3, letterSpacing: "0.06em" }}>CURRENT MONTH</div>
            )}
          </div>
          <button onClick={() => setSelectedMonth(shiftMonth(selectedMonth, 1))} style={{
            width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(255,255,255,0.08)",
            background: selectedMonth === getCurrentMonth() ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.03)",
            color: selectedMonth === getCurrentMonth() ? "#333" : "#888", fontSize: 16,
            cursor: selectedMonth === getCurrentMonth() ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
          }}
            disabled={selectedMonth === getCurrentMonth()}
            onMouseEnter={e => { if (selectedMonth !== getCurrentMonth()) { e.currentTarget.style.background = "rgba(245,158,11,0.1)"; e.currentTarget.style.color = "#f59e0b"; } }}
            onMouseLeave={e => { e.currentTarget.style.background = selectedMonth === getCurrentMonth() ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.03)"; e.currentTarget.style.color = selectedMonth === getCurrentMonth() ? "#333" : "#888"; }}
          >â</button>
          {selectedMonth !== getCurrentMonth() && (
            <button onClick={() => setSelectedMonth(getCurrentMonth())} style={{
              padding: "5px 12px", borderRadius: 7, border: "none",
              background: "rgba(245,158,11,0.12)", color: "#f59e0b",
              fontSize: 11, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Space Mono', monospace", transition: "all 0.2s",
            }}>TODAY</button>
          )}
        </div>

        {/* ââ Dashboard ââ */}
        {view === "dashboard" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
              {[
                { label: "Total Leads", value: totalLeads, accent: "#3b82f6" },
                { label: "Sold", value: totalSold, accent: "#10b981" },
                { label: "Conversion", value: `${conversionRate}%`, accent: "#a855f7" },
                { label: "Unpaid", value: `$${totalOwed}`, accent: "#f59e0b" },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14, padding: "20px 18px", animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
                }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 8, fontFamily: "'Space Mono', monospace", letterSpacing: "0.04em" }}>{stat.label.toUpperCase()}</div>
                  <div style={{ fontSize: 30, fontWeight: 700, color: stat.accent, letterSpacing: "-0.03em", lineHeight: 1 }}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
              {/* Recent Leads */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Recent Leads</div>
                  <button onClick={() => setView("leads")} style={{ background: "none", border: "none", color: "#f59e0b", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>View all â</button>
                </div>
                {monthLeads.slice(0, 5).map((lead, i) => (
                  <div key={lead.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "11px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    animation: `slideIn 0.3s ease ${i * 0.06}s both`,
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{lead.name}</div>
                      <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>via {getBirdDogName(lead.birdDogId)} Â· {lead.date}</div>
                    </div>
                    <span style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                      color: STATUS_CONFIG[lead.status].color, background: STATUS_CONFIG[lead.status].bg,
                      fontFamily: "'Space Mono', monospace",
                    }}>{STATUS_CONFIG[lead.status].label}</span>
                  </div>
                ))}
              </div>

              {/* Hounds */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Hounds</div>
                  <button onClick={() => setView("hounds")} style={{ background: "none", border: "none", color: "#f59e0b", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Manage â</button>
                </div>
                {birdDogs.map((bd, i) => {
                  const s = getBirdDogStats(bd.id);
                  return (
                    <div key={bd.id} onClick={() => { setSelectedBirdDog(bd.id); setView("leads"); }} style={{
                      padding: "14px 12px", borderRadius: 10, marginBottom: 8,
                      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
                      cursor: "pointer", transition: "all 0.2s", animation: `fadeUp 0.3s ease ${i * 0.08}s both`,
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(245,158,11,0.06)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{bd.name}</div>
                          <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>{s.total} leads Â· {s.sold} sold</div>
                        </div>
                        {s.owed > 0 && <div style={{ fontSize: 13, fontWeight: 600, color: "#f59e0b", fontFamily: "'Space Mono', monospace" }}>${s.owed}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ââ Leads View ââ */}
        {view === "leads" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>
                  {selectedBirdDog ? `${getBirdDogName(selectedBirdDog)}'s Leads` : "All Leads"}
                </div>
                {selectedBirdDog && (
                  <button onClick={() => setSelectedBirdDog(null)} style={{
                    background: "none", border: "none", color: "#f59e0b", fontSize: 12, cursor: "pointer", marginTop: 4, fontFamily: "'DM Sans', sans-serif",
                  }}>â Show all leads</button>
                )}
              </div>
              <button onClick={() => setShowAddLead(true)} style={{
                padding: "9px 20px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>+ Add Lead</button>
            </div>

            {/* Search Bar */}
            <div style={{ position: "relative", marginBottom: 14 }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name or phone number..."
                style={{
                  width: "100%", padding: "11px 14px 11px 40px", borderRadius: 10,
                  border: searchQuery ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  background: searchQuery ? "rgba(245,158,11,0.04)" : "rgba(255,255,255,0.03)",
                  color: "#e8e8ed", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none",
                  transition: "all 0.2s",
                }}
              />
              <span style={{
                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                fontSize: 15, color: searchQuery ? "#f59e0b" : "#555", pointerEvents: "none",
              }}>â</span>
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.08)", border: "none", color: "#999",
                  width: 22, height: 22, borderRadius: 6, fontSize: 12, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>Ã</button>
              )}
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
              <button onClick={() => setFilterStatus("all")} style={{
                padding: "5px 14px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.08)",
                background: filterStatus === "all" ? "rgba(255,255,255,0.08)" : "transparent",
                color: filterStatus === "all" ? "#e8e8ed" : "#666", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>All</button>
              {STATUSES.map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{
                  padding: "5px 14px", borderRadius: 7,
                  border: `1px solid ${filterStatus === s ? STATUS_CONFIG[s].color + "44" : "rgba(255,255,255,0.06)"}`,
                  background: filterStatus === s ? STATUS_CONFIG[s].bg : "transparent",
                  color: filterStatus === s ? STATUS_CONFIG[s].color : "#666",
                  fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textTransform: "capitalize",
                }}>{STATUS_CONFIG[s].label}</button>
              ))}
            </div>

            {searchQuery && (
              <div style={{ fontSize: 12, color: "#666", marginBottom: 12, fontFamily: "'Space Mono', monospace" }}>
                {filteredLeads.length} result{filteredLeads.length !== 1 ? "s" : ""} for "{searchQuery}"
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredLeads.map((lead, i) => (
                <div key={lead.id} style={{
                  background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, padding: "14px 18px",
                  display: "grid", gridTemplateColumns: "1.2fr 0.8fr 0.5fr 0.5fr 0.4fr",
                  alignItems: "center", gap: 12, animation: `fadeUp 0.3s ease ${i * 0.04}s both`, transition: "background 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{lead.name}</div>
                    <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{lead.phone}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#888" }}>via {getBirdDogName(lead.birdDogId)}</div>
                    <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>{lead.notes}</div>
                  </div>
                  <div>
                    <button onClick={() => cycleStatus(lead.id)} style={{
                      padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer",
                      fontSize: 11, fontWeight: 600, color: STATUS_CONFIG[lead.status].color,
                      background: STATUS_CONFIG[lead.status].bg, fontFamily: "'Space Mono', monospace", transition: "all 0.2s",
                    }}>{STATUS_CONFIG[lead.status].label} â»</button>
                  </div>
                  <div style={{ fontSize: 12, color: "#555", fontFamily: "'Space Mono', monospace" }}>{lead.date}</div>
                  <div style={{ textAlign: "right" }}>
                    {lead.status === "sold" && (
                      <button onClick={() => togglePaid(lead.id)} style={{
                        padding: "5px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                        fontSize: 11, fontWeight: 600, color: lead.paidOut ? "#10b981" : "#f59e0b",
                        background: lead.paidOut ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                        fontFamily: "'Space Mono', monospace",
                      }}>{lead.paidOut ? "Paid â" : "$" + lead.amount}</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ââ Hounds View ââ */}
        {view === "hounds" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 600 }}>Hounds</div>
              <button onClick={() => setShowAddBirdDog(true)} style={{
                padding: "9px 20px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>+ Add Hound</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
              {birdDogs.map((bd, i) => {
                const s = getBirdDogStats(bd.id);
                const rate = s.total > 0 ? ((s.sold / s.total) * 100).toFixed(0) : 0;
                return (
                  <div key={bd.id} style={{
                    background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 14, padding: 22, cursor: "pointer", transition: "all 0.2s",
                    animation: `fadeUp 0.3s ease ${i * 0.08}s both`,
                  }}
                    onClick={() => { setSelectedBirdDog(bd.id); setView("leads"); }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"; e.currentTarget.style.background = "rgba(245,158,11,0.04)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 600 }}>{bd.name}</div>
                        <div style={{ fontSize: 12, color: "#555", marginTop: 3 }}>{bd.phone}</div>
                        <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 4, fontFamily: "'Space Mono', monospace", fontWeight: 600 }}>${bd.rate}/lead</div>
                      </div>
                      <div style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: `conic-gradient(#10b981 ${rate * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, background: "#16161d",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, color: "#10b981", fontFamily: "'Space Mono', monospace",
                        }}>{rate}%</div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                      {[
                        { label: "Leads", val: s.total, color: "#3b82f6" },
                        { label: "Sold", val: s.sold, color: "#10b981" },
                        { label: "Owed", val: `$${s.owed}`, color: "#f59e0b" },
                        { label: "Paid", val: `$${s.paid}`, color: "#666" },
                      ].map((item, j) => (
                        <div key={j} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: item.color, fontFamily: "'Space Mono', monospace" }}>{item.val}</div>
                          <div style={{ fontSize: 10, color: "#555", marginTop: 2, letterSpacing: "0.04em" }}>{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ââ Payouts View ââ */}
        {view === "payouts" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Payouts</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Total Earned", val: `$${monthLeads.filter(l => l.status === "sold").reduce((s, l) => s + l.amount, 0)}`, color: "#10b981" },
                { label: "Paid Out", val: `$${totalPaid}`, color: "#3b82f6" },
                { label: "Outstanding", val: `$${totalOwed}`, color: "#f59e0b" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14, padding: 18, animation: `fadeUp 0.3s ease ${i * 0.08}s both`,
                }}>
                  <div style={{ fontSize: 11, color: "#666", fontFamily: "'Space Mono', monospace", marginBottom: 6, letterSpacing: "0.04em" }}>{s.label.toUpperCase()}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: s.color, fontFamily: "'Space Mono', monospace" }}>{s.val}</div>
                </div>
              ))}
            </div>
            {birdDogs.map((bd, i) => {
              const s = getBirdDogStats(bd.id);
              const bdLeads = monthLeads.filter(l => l.birdDogId === bd.id && l.status === "sold");
              if (bdLeads.length === 0) return null;
              return (
                <div key={bd.id} style={{
                  background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14, padding: 20, marginBottom: 14, animation: `fadeUp 0.3s ease ${i * 0.1}s both`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{bd.name}</div>
                    <div style={{ display: "flex", gap: 16, fontSize: 13, fontFamily: "'Space Mono', monospace" }}>
                      <span style={{ color: "#10b981" }}>Paid: ${s.paid}</span>
                      <span style={{ color: s.owed > 0 ? "#f59e0b" : "#444" }}>Owed: ${s.owed}</span>
                    </div>
                  </div>
                  {bdLeads.map((lead, j) => (
                    <div key={lead.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 0", borderTop: j > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{lead.name}</div>
                        <div style={{ fontSize: 11, color: "#555" }}>{lead.notes} Â· {lead.date}</div>
                      </div>
                      <button onClick={() => togglePaid(lead.id)} style={{
                        padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                        fontSize: 12, fontWeight: 600,
                        color: lead.paidOut ? "#10b981" : "#fff",
                        background: lead.paidOut ? "rgba(16,185,129,0.12)" : "linear-gradient(135deg, #f59e0b, #ef4444)",
                        fontFamily: "'Space Mono', monospace",
                      }}>{lead.paidOut ? "Paid â" : "Mark Paid $" + lead.amount}</button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ââ Add Lead Modal ââ */}
      {showAddLead && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
        }} onClick={() => { setShowAddLead(false); clearImage(); }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#18181f", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18, padding: 28, width: 420, animation: "fadeUp 0.3s ease",
          }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Add New Lead</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {[
                { val: "text", label: "Text / Manual", desc: "Name & number" },
                { val: "screenshot", label: "Screenshot", desc: "Photo / doc" },
              ].map(s => (
                <button key={s.val} onClick={() => setNewLead({ ...newLead, source: s.val })} style={{
                  flex: 1, padding: "12px", borderRadius: 10, cursor: "pointer",
                  border: `1px solid ${newLead.source === s.val ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.06)"}`,
                  background: newLead.source === s.val ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.02)",
                  color: newLead.source === s.val ? "#f59e0b" : "#888", textAlign: "left", fontFamily: "'DM Sans', sans-serif",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{s.desc}</div>
                </button>
              ))}
            </div>
            {newLead.source === "screenshot" && (
              <div style={{ marginBottom: 16 }}>
                {!imagePreview ? (
                  <label style={{
                    display: "block", border: "2px dashed rgba(245,158,11,0.3)", borderRadius: 12,
                    padding: "28px 20px", textAlign: "center", background: "rgba(245,158,11,0.04)",
                    cursor: "pointer", transition: "all 0.2s",
                  }}>
                    <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload}
                      style={{ display: "none" }} />
                    <div style={{ fontSize: 32, marginBottom: 8 }}>ð¸</div>
                    <div style={{ fontSize: 13, color: "#ccc", fontWeight: 500 }}>Tap to upload or take a photo</div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 6 }}>Screenshots of texts, business cards, handwritten notes</div>
                    <div style={{
                      marginTop: 10, padding: "6px 14px", borderRadius: 8, display: "inline-block",
                      background: "rgba(245,158,11,0.12)", color: "#f59e0b", fontSize: 11, fontWeight: 600,
                      fontFamily: "'Space Mono', monospace",
                    }}>AI WILL EXTRACT INFO AUTOMATICALLY</div>
                  </label>
                ) : (
                  <div style={{
                    borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.02)", position: "relative",
                  }}>
                    {/* Image Preview */}
                    <div style={{ position: "relative" }}>
                      <img src={imagePreview} alt="Uploaded" style={{
                        width: "100%", maxHeight: 180, objectFit: "cover", display: "block",
                        filter: extracting ? "brightness(0.6)" : "brightness(0.85)",
                        transition: "filter 0.3s",
                      }} />
                      {/* Scanning overlay */}
                      {extracting && (
                        <div style={{
                          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center",
                        }}>
                          <div style={{
                            position: "absolute", top: 0, left: 0, right: 0, height: "3px",
                            background: "linear-gradient(90deg, transparent, #f59e0b, transparent)",
                            animation: "scanLine 1.5s ease-in-out infinite",
                          }} />
                          <div style={{
                            padding: "8px 18px", borderRadius: 10,
                            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
                          }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#f59e0b", textAlign: "center" }}>
                              Extracting lead info...
                            </div>
                            <div style={{ fontSize: 11, color: "#888", textAlign: "center", marginTop: 3 }}>
                              AI is reading the image
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Close button */}
                      <button onClick={clearImage} style={{
                        position: "absolute", top: 8, right: 8, width: 28, height: 28,
                        borderRadius: 8, border: "none", background: "rgba(0,0,0,0.6)",
                        color: "#fff", fontSize: 14, cursor: "pointer", display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }}>Ã</button>
                    </div>
                    {/* Extraction result */}
                    {extractResult && !extracting && (
                      <div style={{ padding: "12px 14px" }}>
                        <div style={{
                          display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
                        }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: 4, background: "#10b981",
                            boxShadow: "0 0 6px rgba(16,185,129,0.5)",
                          }} />
                          <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600, fontFamily: "'Space Mono', monospace" }}>
                            EXTRACTED Â· {extractResult.confidence}% CONFIDENCE
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "#999", lineHeight: 1.5 }}>
                          Found: <span style={{ color: "#e8e8ed", fontWeight: 500 }}>{extractResult.name}</span> Â· <span style={{ color: "#e8e8ed", fontWeight: 500 }}>{extractResult.phone}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>Fields auto-filled below â review and edit as needed</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {[
              { key: "name", label: "Customer Name", placeholder: "e.g. James Williams" },
              { key: "phone", label: "Phone Number", placeholder: "(555) 000-0000" },
              { key: "notes", label: "Notes", placeholder: "Vehicle interest, down payment, etc." },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5, fontFamily: "'Space Mono', monospace", letterSpacing: "0.03em" }}>{field.label}</label>
                <input value={newLead[field.key]} onChange={e => setNewLead({ ...newLead, [field.key]: e.target.value })} placeholder={field.placeholder} style={{
                  width: "100%", padding: "10px 14px", borderRadius: 9,
                  border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)",
                  color: "#e8e8ed", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none",
                }} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5, fontFamily: "'Space Mono', monospace", letterSpacing: "0.03em" }}>Hound</label>
              <select value={newLead.birdDogId} onChange={e => setNewLead({ ...newLead, birdDogId: e.target.value })} style={{
                width: "100%", padding: "10px 14px", borderRadius: 9,
                border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)",
                color: newLead.birdDogId ? "#e8e8ed" : "#555", fontSize: 14,
                fontFamily: "'DM Sans', sans-serif", outline: "none", appearance: "auto",
              }}>
                <option value="">Select hound...</option>
                {birdDogs.map(bd => <option key={bd.id} value={bd.id}>{bd.name} Â· ${bd.rate}/lead</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setShowAddLead(false); clearImage(); }} style={{
                flex: 1, padding: "11px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent", color: "#888", fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>Cancel</button>
              <button onClick={handleAddLead} style={{
                flex: 1, padding: "11px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>Add Lead</button>
            </div>
          </div>
        </div>
      )}

      {/* ââ Add Hound Modal ââ */}
      {showAddBirdDog && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
        }} onClick={() => setShowAddBirdDog(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#18181f", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18, padding: 28, width: 400, animation: "fadeUp 0.3s ease",
          }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Add Hound</div>
            {[
              { key: "name", label: "Name", placeholder: "e.g. Marcus Johnson" },
              { key: "phone", label: "Phone", placeholder: "(555) 000-0000" },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5, fontFamily: "'Space Mono', monospace" }}>{field.label}</label>
                <input value={newBirdDog[field.key]} onChange={e => setNewBirdDog({ ...newBirdDog, [field.key]: e.target.value })} placeholder={field.placeholder} style={{
                  width: "100%", padding: "10px 14px", borderRadius: 9,
                  border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)",
                  color: "#e8e8ed", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none",
                }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 5, fontFamily: "'Space Mono', monospace" }}>Pay Per Lead ($)</label>
              <input
                value={newBirdDog.rate}
                onChange={e => setNewBirdDog({ ...newBirdDog, rate: e.target.value })}
                placeholder="150"
                type="number"
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 9,
                  border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)",
                  color: "#e8e8ed", fontSize: 14, fontFamily: "'Space Mono', monospace", outline: "none",
                }}
              />
              <div style={{ fontSize: 11, color: "#555", marginTop: 5 }}>Amount this hound gets paid per sold lead. Defaults to $150 if left blank.</div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button onClick={() => setShowAddBirdDog(false)} style={{
                flex: 1, padding: "11px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent", color: "#888", fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>Cancel</button>
              <button onClick={handleAddBirdDog} style={{
                flex: 1, padding: "11px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>Add Hound</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* âââââââââââââââââââââââââââââââââââââââââââââ
   MAIN APP â routes between login, admin, referrer
   âââââââââââââââââââââââââââââââââââââââââââââ */
export default function LeadHound() {
  const [leads, setLeads] = useState(LEADS);
  const [birdDogs, setBirdDogs] = useState(BIRD_DOGS);
  const [user, setUser] = useState(null);

  function handleLogin(role, birdDogId) {
    setUser({ role, birdDogId });
  }

  function handleLogout() {
    setUser(null);
  }

  if (!user) {
    return <LoginScreen birdDogs={birdDogs} onLogin={handleLogin} />;
  }

  if (user.role === "referrer") {
    const bd = birdDogs.find(b => b.id === user.birdDogId);
    return <ReferrerPortal birdDog={bd} leads={leads} onLogout={handleLogout} />;
  }

  return <AdminDashboard leads={leads} setLeads={setLeads} birdDogs={birdDogs} setBirdDogs={setBirdDogs} onLogout={handleLogout} />;
                                       }
