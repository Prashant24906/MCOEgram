import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

// ─── Static data ──────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  { label: "CS" }, { label: "IT" }, { label: "MECH" },
  { label: "ENTC" }, { label: "AIML" },
];

const YEARS = [
  { label: "1st" }, { label: "2nd" },
  { label: "3rd" }, { label: "4th" },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  :root {
    --mcoe-navy:       #0f1b35;
    --mcoe-navy-mid:   #162040;
    --mcoe-navy-light: #1e2d54;
    --mcoe-card:       #192348;
    --mcoe-border:     rgba(255,255,255,0.07);
    --mcoe-gold:       #f5c842;
    --mcoe-gold-dim:   rgba(245,200,66,0.13);
    --mcoe-gold-glow:  0 0 32px rgba(245,200,66,0.22);
    --mcoe-teal:       #38d9c0;
    --mcoe-text:       #e8eaf2;
    --mcoe-muted:      #7a86a8;
    --radius-sm:       8px;
    --radius-lg:       20px;
    --transition:      all 0.24s cubic-bezier(0.4,0,0.2,1);
  }

  /* ── Page shell ── */
  .up-root {
    min-height: 100vh;
    background: var(--mcoe-navy);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    padding: 24px 16px;
    position: relative;
    overflow: hidden;
  }

  .up-root * { box-sizing: border-box; }

  /* decorative blurred gold orb */
  .up-root::before {
    content: '';
    position: absolute;
    top: -120px;
    right: -100px;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(245,200,66,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  /* decorative teal orb bottom-left */
  .up-root::after {
    content: '';
    position: absolute;
    bottom: -80px;
    left: -80px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(56,217,192,0.09) 0%, transparent 70%);
    pointer-events: none;
  }

  /* ── Card ── */
  .up-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 480px;
    background: var(--mcoe-card);
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-lg);
    padding: 40px 36px 36px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.5);
    animation: upSlideIn 0.45s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes upSlideIn {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }

  /* ── Logo mark ── */
  .up-logomark {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 28px;
  }

  .up-logomark-icon {
    width: 36px;
    height: 36px;
    background: var(--mcoe-gold-dim);
    border: 1.5px solid var(--mcoe-gold);
    border-radius: 10px;
    display: grid;
    place-items: center;
    color: var(--mcoe-gold);
  }

  .up-logomark-text {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 1.8px;
    color: var(--mcoe-gold);
  }

  /* ── Heading ── */
  .up-heading {
    font-family: 'Syne', sans-serif;
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: var(--mcoe-text);
    line-height: 1.2;
    margin-bottom: 6px;
  }

  .up-sub {
    font-size: 13.5px;
    color: var(--mcoe-muted);
    margin-bottom: 32px;
    line-height: 1.5;
  }

  /* ── Progress bar ── */
  .up-progress-wrap {
    display: flex;
    gap: 6px;
    margin-bottom: 28px;
  }

  .up-progress-step {
    flex: 1;
    height: 3px;
    border-radius: 3px;
    background: var(--mcoe-navy-light);
    transition: var(--transition);
  }

  .up-progress-step.filled { background: var(--mcoe-gold); }

  /* ── Form fields ── */
  .up-fields {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  /* ── Custom text input ── */
  .up-input-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .up-label {
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: var(--mcoe-muted);
  }

  .up-input {
    padding: 12px 14px;
    background: var(--mcoe-navy-light);
    border: 1.5px solid var(--mcoe-border);
    border-radius: var(--radius-sm);
    color: var(--mcoe-text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: var(--transition);
    width: 100%;
  }

  .up-input::placeholder { color: var(--mcoe-muted); }

  .up-input:focus {
    border-color: var(--mcoe-gold);
    background: var(--mcoe-navy-mid);
    box-shadow: 0 0 0 3px var(--mcoe-gold-dim);
  }

  /* ── MUI Autocomplete dark override ── */
  .up-autocomplete .MuiInputBase-root {
    background: var(--mcoe-navy-light) !important;
    border-radius: var(--radius-sm) !important;
    color: var(--mcoe-text) !important;
    font-family: 'DM Sans', sans-serif !important;
    font-size: 14px !important;
    padding: 4px 8px !important;
  }

  .up-autocomplete .MuiOutlinedInput-notchedOutline {
    border: 1.5px solid var(--mcoe-border) !important;
    border-radius: var(--radius-sm) !important;
  }

  .up-autocomplete .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline,
  .up-autocomplete .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: var(--mcoe-gold) !important;
  }

  .up-autocomplete .MuiInputLabel-root {
    color: var(--mcoe-muted) !important;
    font-family: 'DM Sans', sans-serif !important;
  }

  .up-autocomplete .MuiInputLabel-root.Mui-focused { color: var(--mcoe-gold) !important; }

  .up-autocomplete .MuiSvgIcon-root { color: var(--mcoe-muted) !important; }

  .up-autocomplete .MuiAutocomplete-paper,
  .up-autocomplete + * .MuiAutocomplete-paper,
  .MuiAutocomplete-popper .MuiPaper-root {
    background: var(--mcoe-card) !important;
    border: 1px solid var(--mcoe-border) !important;
    color: var(--mcoe-text) !important;
    font-family: 'DM Sans', sans-serif !important;
  }

  .MuiAutocomplete-option {
    font-family: 'DM Sans', sans-serif !important;
    font-size: 14px !important;
    color: var(--mcoe-text) !important;
  }

  .MuiAutocomplete-option:hover,
  .MuiAutocomplete-option[aria-selected="true"] {
    background: var(--mcoe-navy-light) !important;
    color: var(--mcoe-gold) !important;
  }

  /* ── Row for two dropdowns ── */
  .up-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  /* ── Field validation dot ── */
  .up-input-wrap.valid .up-label::after {
    content: ' ✓';
    color: var(--mcoe-teal);
    font-size: 11px;
  }

  /* ── Submit button ── */
  .up-submit {
    margin-top: 8px;
    width: 100%;
    padding: 14px;
    background: var(--mcoe-gold);
    color: var(--mcoe-navy);
    border: none;
    border-radius: var(--radius-sm);
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.3px;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .up-submit:hover:not(:disabled) {
    background: #ffd84d;
    box-shadow: var(--mcoe-gold-glow);
    transform: translateY(-2px);
  }

  .up-submit:active:not(:disabled) { transform: translateY(0); }

  .up-submit:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* ── Footer note ── */
  .up-footer-note {
    margin-top: 20px;
    text-align: center;
    font-size: 12px;
    color: var(--mcoe-muted);
    line-height: 1.6;
  }

  .up-footer-note strong { color: var(--mcoe-gold); }
`;

function injectStyles(id, css) {
  if (document.getElementById(id)) return;
  const tag = document.createElement("style");
  tag.id = id;
  tag.textContent = css;
  document.head.appendChild(tag);
}

// ─── Step progress indicator ──────────────────────────────────────────────────
function Progress({ filled, total }) {
  return (
    <div className="up-progress-wrap">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`up-progress-step${i < filled ? " filled" : ""}`} />
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function UpdateProfile({ user }) {
  const navigate = useNavigate();
  const [info, setInfo] = useState({ name: "", bio: "", year: "", department: "" });
  const [loading, setLoading] = useState(false);

  injectStyles("mcoe-update-profile-styles", STYLES);

  const set = (key) => (e) => setInfo((p) => ({ ...p, [key]: e.target.value }));
  const setAuto = (key) => (_, val) => setInfo((p) => ({ ...p, [key]: val?.label || "" }));

  // count how many of the 4 fields are filled for the progress bar
  const filledCount = [info.name, info.bio, info.year, info.department].filter(Boolean).length;
  const allFilled = filledCount === 4;

  const handleSubmit = async () => {
    if (!allFilled) return;
    setLoading(true);
    try {
      await api.put("/api/users/update", info);
      navigate("/");
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="up-root">
      <div className="up-card">

        {/* Logo */}
        <div className="up-logomark">
          <div className="up-logomark-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <span className="up-logomark-text">MCOEGRAM</span>
        </div>

        {/* Heading */}
        <h1 className="up-heading">Set up your profile</h1>
        <p className="up-sub">
          Tell your college who you are — this only takes a minute.
        </p>

        {/* Progress bar — fills as user completes fields */}
        <Progress filled={filledCount} total={4} />

        {/* Fields */}
        <div className="up-fields">

          {/* Name */}
          <div className={`up-input-wrap${info.name ? " valid" : ""}`}>
            <label className="up-label">Full Name</label>
            <input
              className="up-input"
              type="text"
              placeholder="e.g. Prashant Narwade"
              value={info.name}
              onChange={set("name")}
            />
          </div>

          {/* Bio */}
          <div className={`up-input-wrap${info.bio ? " valid" : ""}`}>
            <label className="up-label">Bio</label>
            <input
              className="up-input"
              type="text"
              placeholder="e.g. CS student, coffee addict ☕"
              value={info.bio}
              onChange={set("bio")}
            />
          </div>

          {/* Year + Department — side by side */}
          <div className="up-row">
            <div className={`up-input-wrap up-autocomplete${info.year ? " valid" : ""}`}>
              <label className="up-label">Year</label>
              <Autocomplete
                options={YEARS}
                value={YEARS.find((y) => y.label === info.year) || null}
                onChange={setAuto("year")}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Year" size="small" />
                )}
              />
            </div>

            <div className={`up-input-wrap up-autocomplete${info.department ? " valid" : ""}`}>
              <label className="up-label">Department</label>
              <Autocomplete
                options={DEPARTMENTS}
                value={DEPARTMENTS.find((d) => d.label === info.department) || null}
                onChange={setAuto("department")}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Dept." size="small" />
                )}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            className="up-submit"
            onClick={handleSubmit}
            disabled={!allFilled || loading}
          >
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{ animation: "spin 0.8s linear infinite" }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
                </svg>
                Saving…
              </>
            ) : (
              <>
                Join MCOEgram
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="up-footer-note">
          Welcome to <strong>MCOE</strong>'s exclusive social space.<br />
          Your profile is only visible to fellow students.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}