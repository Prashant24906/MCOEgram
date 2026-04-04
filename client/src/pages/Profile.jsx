import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { MessageSquare, Grid, BookOpen, UserPlus, UserCheck, Clock, Camera } from "lucide-react";
import Moments from "./Moments";
import Articles from "./Articles";
import UpdateProfile from "./UpdateProfile";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

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
    --mcoe-gold-dim:   rgba(245,200,66,0.15);
    --mcoe-gold-glow:  rgba(245,200,66,0.35);
    --mcoe-teal:       #38d9c0;
    --mcoe-text:       #e8eaf2;
    --mcoe-muted:      #7a86a8;
    --mcoe-danger:     #ff5c6e;
    --radius-sm:       8px;
    --radius-md:       14px;
    --radius-lg:       20px;
    --shadow-card:     0 4px 24px rgba(0,0,0,0.35);
    --shadow-glow:     0 0 20px rgba(245,200,66,0.18);
    --transition:      all 0.22s cubic-bezier(0.4,0,0.2,1);
  }

  .prp-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--mcoe-navy);
    color: var(--mcoe-text);
    min-height: 100vh;   /* sidebar is fixed left — no top bar to subtract */
    padding-bottom: 60px;
  }

  .prp-root * { box-sizing: border-box; }

  /* ── Profile hero band ── */
  .prp-hero-band {
    background: linear-gradient(160deg, var(--mcoe-navy-light) 0%, var(--mcoe-navy-mid) 100%);
    border-bottom: 1px solid var(--mcoe-border);
    padding: 36px 24px 28px;
  }

  .prp-hero-inner {
    max-width: 700px;
    margin: 0 auto;
    display: flex;
    align-items: flex-start;
    gap: 28px;
    flex-wrap: wrap;
  }

  /* ── Avatar ── */
  .prp-avatar-wrap {
    position: relative;
    flex-shrink: 0;
  }

  .prp-avatar {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--mcoe-gold);
    box-shadow: 0 0 0 4px var(--mcoe-gold-dim);
  }

  /* Camera overlay on own profile */
  .prp-avatar-edit {
    position: relative;
    cursor: pointer;
    display: inline-block;
  }

  .prp-avatar-edit:hover .prp-avatar-overlay {
    opacity: 1;
  }

  .prp-avatar-overlay {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(0,0,0,0.52);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    opacity: 0;
    transition: var(--transition);
    color: #fff;
    font-size: 10px;
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    letter-spacing: 0.4px;
    cursor: pointer;
  }

  .prp-avatar-uploading {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(0,0,0,0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--mcoe-gold);
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 700;
  }

  /* ── Info section ── */
  .prp-info { flex: 1; min-width: 200px; }

  .prp-name {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 800;
    color: var(--mcoe-text);
    letter-spacing: -0.4px;
    margin-bottom: 6px;
  }

  .prp-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-bottom: 10px;
  }

  .prp-tag {
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.3px;
    background: var(--mcoe-gold-dim);
    border: 1px solid rgba(245,200,66,0.25);
    color: var(--mcoe-gold);
  }

  .prp-bio {
    font-size: 13.5px;
    color: var(--mcoe-muted);
    line-height: 1.55;
    margin-bottom: 14px;
    max-width: 400px;
  }

  /* ── Action buttons ── */
  .prp-actions { display: flex; gap: 10px; flex-wrap: wrap; }

  .prp-btn-primary {
    padding: 9px 20px;
    background: var(--mcoe-gold);
    color: var(--mcoe-navy);
    border: none;
    border-radius: var(--radius-sm);
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .prp-btn-primary:hover {
    background: #ffd84d;
    box-shadow: var(--shadow-glow);
    transform: translateY(-1px);
  }

  .prp-btn-secondary {
    padding: 9px 20px;
    background: none;
    color: var(--mcoe-teal);
    border: 1px solid var(--mcoe-teal);
    border-radius: var(--radius-sm);
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .prp-btn-secondary:hover {
    background: rgba(56,217,192,0.1);
    transform: translateY(-1px);
  }

  /* ── Friend request button states ── */
  .prp-btn-friend {
    padding: 9px 20px;
    border-radius: var(--radius-sm);
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 6px;
    border: none;
  }

  .prp-btn-friend.send {
    background: var(--mcoe-gold);
    color: var(--mcoe-navy);
  }
  .prp-btn-friend.send:hover {
    background: #ffd84d;
    box-shadow: var(--shadow-glow);
    transform: translateY(-1px);
  }

  .prp-btn-friend.sent {
    background: var(--mcoe-gold-dim);
    color: var(--mcoe-gold);
    border: 1px solid rgba(245,200,66,0.35);
    cursor: default;
  }

  .prp-btn-friend.cancel {
    background: rgba(255,92,110,0.1);
    color: var(--mcoe-danger);
    border: 1px solid rgba(255,92,110,0.3);
  }
  .prp-btn-friend.cancel:hover {
    background: rgba(255,92,110,0.2);
    transform: translateY(-1px);
  }

  .prp-btn-friend.friends {
    background: rgba(56,217,192,0.12);
    color: var(--mcoe-teal);
    border: 1px solid rgba(56,217,192,0.3);
    cursor: default;
  }

  .prp-btn-friend.incoming {
    background: var(--mcoe-gold);
    color: var(--mcoe-navy);
  }
  .prp-btn-friend.incoming:hover {
    background: #ffd84d;
    box-shadow: var(--shadow-glow);
    transform: translateY(-1px);
  }

  /* ── Stats row ── */
  .prp-stats {
    display: flex;
    gap: 0;
    border-top: 1px solid var(--mcoe-border);
    margin-top: 20px;
  }

  .prp-stat {
    flex: 1;
    text-align: center;
    padding: 16px 12px;
    border-right: 1px solid var(--mcoe-border);
  }

  .prp-stat:last-child { border-right: none; }

  .prp-stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 800;
    color: var(--mcoe-gold);
    display: block;
  }

  .prp-stat-label {
    font-size: 11px;
    color: var(--mcoe-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 2px;
    display: block;
  }

  /* ── Feed tabs ── */
  .prp-tabs {
    max-width: 700px;
    margin: 0 auto;
    display: flex;
    border-bottom: 1px solid var(--mcoe-border);
    padding: 0 24px;
    margin-top: 0;
  }

  .prp-tab {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 14px 20px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--mcoe-muted);
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    letter-spacing: 0.3px;
    margin-bottom: -1px;
  }

  .prp-tab:hover { color: var(--mcoe-text); }

  .prp-tab.active {
    color: var(--mcoe-gold);
    border-bottom-color: var(--mcoe-gold);
  }

  /* ── Feed area ── */
  .prp-feed-area {
    max-width: 700px;
    margin: 0 auto;
    padding: 24px;
  }

  /* ── Loading state ── */
  .prp-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    color: var(--mcoe-muted);
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    gap: 10px;
  }

  /* ── Modal (Bootstrap rethemed) ── */
  .prp-modal .modal-content {
    background: var(--mcoe-card);
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-lg);
    color: var(--mcoe-text);
  }

  .prp-modal .modal-header {
    border-bottom: 1px solid var(--mcoe-border);
    padding: 16px 20px;
  }

  .prp-modal .modal-header h5 {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 16px;
    color: var(--mcoe-text);
    margin: 0;
  }

  .prp-modal .btn-close { filter: invert(1) opacity(0.6); }

  .prp-modal-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .prp-modal .modal-footer { border-top: 1px solid var(--mcoe-border); padding: 14px 20px; }

  .prp-modal-input {
    width: 100%;
    padding: 11px 14px;
    background: var(--mcoe-navy-light);
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-sm);
    color: var(--mcoe-text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: var(--transition);
  }

  .prp-modal-input::placeholder { color: var(--mcoe-muted); }
  .prp-modal-input:focus { border-color: var(--mcoe-gold); }

  .prp-modal-save-btn {
    padding: 9px 22px;
    background: var(--mcoe-gold);
    color: var(--mcoe-navy);
    border: none;
    border-radius: var(--radius-sm);
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    transition: var(--transition);
  }

  .prp-modal-save-btn:hover { background: #ffd84d; box-shadow: var(--shadow-glow); }

  /* MUI TextField dark override — scoped to modal */
  .prp-modal .MuiInputBase-root {
    color: var(--mcoe-text) !important;
    background: var(--mcoe-navy-light) !important;
    border-radius: var(--radius-sm) !important;
  }

  .prp-modal .MuiOutlinedInput-notchedOutline {
    border-color: var(--mcoe-border) !important;
  }

  .prp-modal .MuiInputLabel-root { color: var(--mcoe-muted) !important; }

  .prp-modal .MuiAutocomplete-paper {
    background: var(--mcoe-card) !important;
    color: var(--mcoe-text) !important;
    border: 1px solid var(--mcoe-border) !important;
  }

  .prp-modal .MuiAutocomplete-option { color: var(--mcoe-text) !important; }

  .prp-modal .MuiAutocomplete-option:hover,
  .prp-modal .MuiAutocomplete-option[aria-selected="true"] {
    background: var(--mcoe-navy-light) !important;
  }

  .prp-modal .MuiSvgIcon-root { color: var(--mcoe-muted) !important; }
`;

function injectStyles(id, css) {
  if (document.getElementById(id)) return;
  const tag = document.createElement("style");
  tag.id = id;
  tag.textContent = css;
  document.head.appendChild(tag);
}

const DEPARTMENTS = [
  { label: "CS" }, { label: "IT" }, { label: "MECH" },
  { label: "ENTC" }, { label: "AIML" },
];

const YEARS = [
  { label: "1st" }, { label: "2nd" }, { label: "3rd" }, { label: "4th" },
];

// ─── Component ────────────────────────────────────────────────────────────────

function Profile({ currentUser }) {
  const { userId } = useParams();
  const navigate = useNavigate();

  const effectiveUserId = userId || currentUser?._id;
  const isOwnProfile = currentUser?._id === effectiveUserId;

  const [profileUser, setProfileUser] = useState(null);
  const [moments, setMoments] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedFeed, setSelectedFeed] = useState("Articles");
  const [credentials, setCredentials] = useState({
    name: "", bio: "", year: "", department: "",
  });

  // ── Friend request state ──
  // status: "none" | "pending_sent" | "pending_received" | "accepted" | "rejected"
  const [friendStatus, setFriendStatus] = useState("none");
  const [friendRequestId, setFriendRequestId] = useState(null);
  const [friendLoading, setFriendLoading] = useState(false);

  // ── Profile pic upload state ──
  const [picUploading, setPicUploading] = useState(false);

  useEffect(() => { injectStyles("mcoe-profile-styles", STYLES); }, []);

  // ── Single consolidated data fetch (fixes duplicate API calls) ──
  useEffect(() => {
    if (!currentUser) return;

    const fetchAll = async () => {
      try {
        const requests = [
          api.get(`/api/users/${effectiveUserId}`),
          api.get(`/api/moments`),
          api.get(`/api/moments/article`),
        ];

        // Fetch friendship status only when viewing someone else's profile
        if (!isOwnProfile) {
          requests.push(api.get(`/api/friends/status/${effectiveUserId}`));
        }

        const [userRes, postsRes, articlesRes, friendRes] =
          await Promise.all(requests);

        setProfileUser(userRes.data);

        setMoments(
          postsRes.data.filter(
            (p) => p.user && p.user._id === effectiveUserId
          )
        );

        setArticles(
          articlesRes.data.filter(
            (a) => a.user && a.user._id === effectiveUserId
          )
        );

        if (friendRes) {
          setFriendStatus(friendRes.data.status);
          setFriendRequestId(friendRes.data.requestId);
        }
      } catch (err) {
        console.error("Profile fetch failed:", err);
      }
    };

    fetchAll();
  }, [effectiveUserId, currentUser, isOwnProfile]);

  // ── Sync edit form when profileUser loads ──
  useEffect(() => {
    if (!profileUser) return;
    setCredentials({
      name: profileUser.name || "",
      bio: profileUser.bio || "",
      department: profileUser.department || "",
      year: profileUser.year || "",
    });
  }, [profileUser]);

  const handleChange = (e) =>
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const saveProfile = async () => {
    try {
      const res = await api.put("/api/users/update", credentials);
      setProfileUser(res.data);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const navigateToChat = () =>
    navigate("/chats", { state: { selectedUser: profileUser } });

  // ── Friend request handlers ──
  const sendFriendRequest = async () => {
    setFriendLoading(true);
    try {
      const res = await api.post(`/api/friends/request/${effectiveUserId}`);
      setFriendStatus("pending_sent");
      setFriendRequestId(res.data._id);
    } catch (err) {
      // If a request already exists (409) re-sync status
      if (err.response?.status === 409) {
        setFriendStatus(err.response.data.request?.status === "accepted" ? "accepted" : "pending_sent");
      }
      console.error("Send request failed:", err);
    } finally {
      setFriendLoading(false);
    }
  };

  const cancelFriendRequest = async () => {
    setFriendLoading(true);
    try {
      await api.delete(`/api/friends/request/${effectiveUserId}`);
      setFriendStatus("none");
      setFriendRequestId(null);
    } catch (err) {
      console.error("Cancel request failed:", err);
    } finally {
      setFriendLoading(false);
    }
  };

  const acceptFriendRequest = async () => {
    if (!friendRequestId) return;
    setFriendLoading(true);
    try {
      await api.put(`/api/friends/request/${friendRequestId}/accept`);
      setFriendStatus("accepted");
    } catch (err) {
      console.error("Accept request failed:", err);
    } finally {
      setFriendLoading(false);
    }
  };

  // ── Render the correct friend button based on status ──
  const renderFriendBtn = () => {
    if (friendLoading) {
      return (
        <button className="prp-btn-friend sent" disabled>
          <Clock size={14} /> Loading…
        </button>
      );
    }
    switch (friendStatus) {
      case "none":
      case "rejected":
        return (
          <button className="prp-btn-friend send" onClick={sendFriendRequest}>
            <UserPlus size={14} /> Add Friend
          </button>
        );
      case "pending_sent":
        return (
          <button className="prp-btn-friend cancel" onClick={cancelFriendRequest}>
            <Clock size={14} /> Cancel Request
          </button>
        );
      case "pending_received":
        return (
          <button className="prp-btn-friend incoming" onClick={acceptFriendRequest}>
            <UserCheck size={14} /> Accept Request
          </button>
        );
      case "accepted":
        return (
          <button className="prp-btn-friend friends" disabled>
            <UserCheck size={14} /> Friends
          </button>
        );
      default:
        return null;
    }
  };

  // ── Profile picture upload handler ──
  const handlePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPicUploading(true);
    try {
      const formData = new FormData();
      formData.append("profilePic", file);
      const res = await api.put("/api/users/update-pic", formData);
      // Update local profileUser so avatar re-renders immediately
      setProfileUser((prev) => ({ ...prev, profilePic: res.data.profilePic }));
    } catch (err) {
      console.error("Profile pic upload failed:", err);
    } finally {
      setPicUploading(false);
      // Reset the file input so the same file can be re-selected
      e.target.value = "";
    }
  };

  // ── Guards ──
  if (!currentUser) return null;
  if (!profileUser) {
    return (
      <div className="prp-loading nb-page-offset">Loading profile…</div>
    );
  }

  // ── If profile incomplete, show update prompt ──
  if (!currentUser.department) {
    return <UpdateProfile user={currentUser} />;
  }

  return (
    <>

      <div className="prp-root">
        {/* ── Profile hero ── */}
        <div className="prp-hero-band">
          <div className="prp-hero-inner">
            <div className="prp-avatar-wrap">
              {isOwnProfile ? (
                /* Clickable avatar for own profile */
                <label className="prp-avatar-edit" title="Change profile picture">
                  <img
                    src={profileUser.profilePic}
                    alt={profileUser.name}
                    className="prp-avatar"
                    style={picUploading ? { opacity: 0.5 } : {}}
                  />
                  {picUploading ? (
                    <div className="prp-avatar-uploading">⏳</div>
                  ) : (
                    <div className="prp-avatar-overlay">
                      <Camera size={20} />
                      Change
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handlePicChange}
                    disabled={picUploading}
                  />
                </label>
              ) : (
                <img
                  src={profileUser.profilePic}
                  alt={profileUser.name}
                  className="prp-avatar"
                />
              )}
            </div>

            <div className="prp-info">
              <div className="prp-name">{profileUser.name}</div>

              <div className="prp-tags">
                {profileUser.department && (
                  <span className="prp-tag">{profileUser.department}</span>
                )}
                {profileUser.year && (
                  <span className="prp-tag">{profileUser.year} Year</span>
                )}
              </div>

              <p className="prp-bio">{profileUser.bio || "No bio yet."}</p>

              <div className="prp-actions">
                {isOwnProfile ? (
                  <button
                    className="prp-btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#prpEditModal"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    {renderFriendBtn()}
                    <button className="prp-btn-secondary" onClick={navigateToChat}>
                      <MessageSquare size={14} /> Message
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ maxWidth: 700, margin: "20px auto 0" }}>
            <div className="prp-stats">
              <div className="prp-stat">
                <span className="prp-stat-value">{articles.length}</span>
                <span className="prp-stat-label">Articles</span>
              </div>
              <div className="prp-stat">
                <span className="prp-stat-value">{moments.length}</span>
                <span className="prp-stat-label">Moments</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Feed tabs ── */}
        <div className="prp-tabs">
          <button
            className={`prp-tab${selectedFeed === "Articles" ? " active" : ""}`}
            onClick={() => setSelectedFeed("Articles")}
          >
            <BookOpen size={14} /> Articles
          </button>
          <button
            className={`prp-tab${selectedFeed === "Moments" ? " active" : ""}`}
            onClick={() => setSelectedFeed("Moments")}
          >
            <Grid size={14} /> Moments
          </button>
        </div>

        {/* ── Feed content ── */}
        <div className="prp-feed-area">
          {selectedFeed === "Moments" ? (
            <Moments currentUser={currentUser} />
          ) : (
            <Articles user={currentUser} />
          )}
        </div>
      </div>

      {/* ── Edit Profile Modal ── */}
      <div className="modal fade prp-modal" id="prpEditModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Update Profile</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>

            <div className="prp-modal-body">
              <input
                type="text"
                name="name"
                value={credentials.name}
                onChange={handleChange}
                className="prp-modal-input"
                placeholder="Name"
              />
              <input
                type="text"
                name="bio"
                value={credentials.bio}
                onChange={handleChange}
                className="prp-modal-input"
                placeholder="Bio"
              />
              <Autocomplete
                options={YEARS}
                value={YEARS.find((y) => y.label === credentials.year) || null}
                onChange={(_, val) =>
                  setCredentials((p) => ({ ...p, year: val?.label || "" }))
                }
                renderInput={(params) => <TextField {...params} label="Year" size="small" />}
              />
              <Autocomplete
                options={DEPARTMENTS}
                value={DEPARTMENTS.find((d) => d.label === credentials.department) || null}
                onChange={(_, val) =>
                  setCredentials((p) => ({ ...p, department: val?.label || "" }))
                }
                renderInput={(params) => <TextField {...params} label="Department" size="small" />}
              />
            </div>

            <div className="modal-footer">
              <button
                className="prp-modal-save-btn"
                onClick={saveProfile}
                data-bs-dismiss="modal"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;