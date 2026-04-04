import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import Chat from "./Chat";
import socket from "../sockets";
import { useLocation, useNavigate } from "react-router-dom";

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
    --mcoe-teal-dim:   rgba(56,217,192,0.12);
    --mcoe-text:       #e8eaf2;
    --mcoe-muted:      #7a86a8;
    --mcoe-danger:     #ff5c6e;
    --mcoe-online:     #3ddc84;
    --radius-sm:       8px;
    --radius-md:       14px;
    --radius-lg:       20px;
    --shadow-card:     0 4px 24px rgba(0,0,0,0.35);
    --shadow-glow:     0 0 20px rgba(245,200,66,0.18);
    --transition:      all 0.22s cubic-bezier(0.4,0,0.2,1);
  }

  /* ─────────────────────────────────────────────
     ROOT — full viewport, no top bar
  ───────────────────────────────────────────── */
  .cp-root {
    box-sizing: border-box;
    font-family: 'DM Sans', sans-serif;
    background: var(--mcoe-navy);
    color: var(--mcoe-text);
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .cp-root * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ─────────────────────────────────────────────
     STATUS BAR
  ───────────────────────────────────────────── */
  .cp-status-bar {
    padding: 6px 18px;
    background: var(--mcoe-navy-light);
    border-bottom: 1px solid var(--mcoe-border);
    font-size: 11px;
    color: var(--mcoe-muted);
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .cp-status-bar .dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--mcoe-online);
    flex-shrink: 0;
  }

  /* ─────────────────────────────────────────────
     DESKTOP LAYOUT — side by side
  ───────────────────────────────────────────── */
  .cp-layout {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  /* ── Conversations sidebar ── */
  .cp-sidebar {
    width: 300px;
    min-width: 300px;
    background: var(--mcoe-navy-mid);
    border-right: 1px solid var(--mcoe-border);
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .cp-sidebar-header {
    padding: 20px 20px 14px;
    border-bottom: 1px solid var(--mcoe-border);
    background: linear-gradient(135deg, var(--mcoe-navy-light) 0%, var(--mcoe-navy-mid) 100%);
    flex-shrink: 0;
  }

  .cp-sidebar-title {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: var(--mcoe-text);
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .cp-sidebar-title span.icon {
    background: var(--mcoe-gold-dim);
    border: 1px solid var(--mcoe-gold);
    border-radius: 8px;
    width: 28px; height: 28px;
    display: grid;
    place-items: center;
    font-size: 14px;
  }

  .cp-new-chat-btn {
    width: 100%;
    padding: 10px 14px;
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
    justify-content: center;
    gap: 6px;
  }

  .cp-new-chat-btn:hover {
    background: #ffd84d;
    box-shadow: var(--shadow-glow);
    transform: translateY(-1px);
  }

  /* ── User picker ── */
  .cp-user-picker {
    margin: 8px 12px 0;
    background: var(--mcoe-card);
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    animation: slideDown 0.18s ease;
    flex-shrink: 0;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .cp-user-picker-label {
    padding: 10px 14px 6px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: var(--mcoe-muted);
  }

  .cp-picker-wrap {
    overflow-y: auto;
    max-height: 200px;
  }

  .cp-picker-wrap::-webkit-scrollbar { width: 3px; }
  .cp-picker-wrap::-webkit-scrollbar-thumb { background: var(--mcoe-border); border-radius: 3px; }

  .cp-user-pick-item {
    padding: 10px 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: var(--transition);
    border-top: 1px solid var(--mcoe-border);
  }

  .cp-user-pick-item:hover { background: var(--mcoe-gold-dim); }

  .cp-user-pick-item .avatar {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--mcoe-teal), var(--mcoe-gold));
    display: grid;
    place-items: center;
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: var(--mcoe-navy);
    flex-shrink: 0;
  }

  .cp-user-pick-item .name { font-size: 13px; font-weight: 500; }

  /* ── Chat list ── */
  .cp-chat-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 8px 0;
  }

  .cp-chat-list::-webkit-scrollbar { width: 4px; }
  .cp-chat-list::-webkit-scrollbar-track { background: transparent; }
  .cp-chat-list::-webkit-scrollbar-thumb { background: var(--mcoe-border); border-radius: 4px; }

  .cp-chat-item {
    padding: 11px 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: var(--transition);
    border-left: 2px solid transparent;
  }

  .cp-chat-item:hover {
    background: var(--mcoe-teal-dim);
    border-left-color: var(--mcoe-teal);
  }

  .cp-chat-item.active {
    background: var(--mcoe-gold-dim);
    border-left-color: var(--mcoe-gold);
  }

  .cp-avatar {
    width: 44px; height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--mcoe-teal) 0%, #1a8fd1 100%);
    display: grid;
    place-items: center;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
    position: relative;
  }

  .cp-avatar .online-dot {
    position: absolute;
    bottom: 1px; right: 1px;
    width: 11px; height: 11px;
    border-radius: 50%;
    background: var(--mcoe-online);
    border: 2px solid var(--mcoe-navy-mid);
  }

  .cp-chat-info { flex: 1; min-width: 0; }

  .cp-chat-name {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--mcoe-text);
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cp-chat-name:hover { color: var(--mcoe-gold); }

  .cp-chat-preview {
    font-size: 11.5px;
    color: var(--mcoe-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 3px;
  }

  .cp-unread-badge {
    background: var(--mcoe-gold);
    color: var(--mcoe-navy);
    border-radius: 10px;
    padding: 1px 7px;
    font-size: 10px;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    flex-shrink: 0;
  }

  /* ── Main chat panel ── */
  .cp-main {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--mcoe-navy);
  }

  /* ── Empty state ── */
  .cp-empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    opacity: 0.55;
    user-select: none;
  }

  .cp-empty-icon {
    width: 64px; height: 64px;
    border-radius: 50%;
    border: 2px dashed var(--mcoe-muted);
    display: grid;
    place-items: center;
    font-size: 26px;
  }

  .cp-empty-state p    { font-family: 'Syne', sans-serif; font-size: 15px; color: var(--mcoe-muted); }
  .cp-empty-state span { font-size: 12px; color: var(--mcoe-muted); }

  /* ── Skeleton ── */
  .cp-skeleton {
    padding: 10px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: cpPulse 1.4s ease infinite;
  }

  @keyframes cpPulse {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 0.8; }
  }

  .cp-skel-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--mcoe-navy-light); flex-shrink: 0; }
  .cp-skel-lines  { flex: 1; display: flex; flex-direction: column; gap: 6px; }
  .cp-skel-line   { height: 10px; border-radius: 6px; background: var(--mcoe-navy-light); }

  .cp-no-content {
    padding: 14px 18px;
    font-size: 12px;
    color: var(--mcoe-muted);
    font-style: italic;
  }

  /* ─────────────────────────────────────────────
     MOBILE — WhatsApp-style: one panel at a time
     Slide the conversation list OUT when a chat
     is open, slide it back on back press.
  ───────────────────────────────────────────── */
  @media (max-width: 768px) {

    /* On mobile the sidebar nav is a BOTTOM bar (60px tall) */
    .cp-root {
      height: calc(100vh - 60px);
      /* nb-page-offset adds margin-left on desktop — reset it on mobile */
      margin-left: 0 !important;
    }

    /* Stack panels on top of each other via absolute positioning */
    .cp-layout {
      position: relative;
      overflow: hidden;
    }

    /* ── Conversation list panel ── */
    .cp-sidebar {
      position: absolute;
      top: 0; left: 0;
      width: 100%;
      min-width: unset;
      height: 100%;
      border-right: none;
      /* slide in/out on the X axis */
      transform: translateX(0);
      transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
      z-index: 2;
    }

    /* When a chat is open, slide the list off to the left */
    .cp-sidebar.chat-open {
      transform: translateX(-100%);
      pointer-events: none;
    }

    /* ── Active chat panel ── */
    .cp-main {
      position: absolute;
      top: 0; left: 0;
      width: 100%;
      height: 100%;
      /* start off-screen to the right */
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
      z-index: 1;
    }

    /* When a chat is open, slide the chat panel into view */
    .cp-main.chat-open {
      transform: translateX(0);
    }

    /* ── Mobile chat header: back button + name ── */
    .cp-mobile-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--mcoe-navy-mid);
      border-bottom: 1px solid var(--mcoe-border);
      flex-shrink: 0;
    }

    .cp-back-btn {
      background: none;
      border: none;
      color: var(--mcoe-gold);
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      display: grid;
      place-items: center;
      transition: var(--transition);
      flex-shrink: 0;
    }

    .cp-back-btn:hover { background: var(--mcoe-gold-dim); }

    .cp-mobile-user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
    }

    .cp-mobile-avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--mcoe-teal), #1a8fd1);
      display: grid;
      place-items: center;
      font-family: 'Syne', sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
      position: relative;
    }

    .cp-mobile-avatar .online-dot {
      position: absolute;
      bottom: 0; right: 0;
      width: 9px; height: 9px;
      border-radius: 50%;
      background: var(--mcoe-online);
      border: 2px solid var(--mcoe-navy-mid);
    }

    .cp-mobile-name {
      font-family: 'Syne', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: var(--mcoe-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
    }

    .cp-mobile-name:hover { color: var(--mcoe-gold); }

    .cp-mobile-status {
      font-size: 11px;
      color: var(--mcoe-online);
      margin-top: 1px;
    }

    /* Sidebar header on mobile — bigger touch targets */
    .cp-sidebar-header { padding: 16px 16px 12px; }
    .cp-sidebar-title  { font-size: 20px; margin-bottom: 10px; }

    .cp-new-chat-btn {
      padding: 12px 14px;
      font-size: 14px;
      border-radius: 10px;
    }

    /* Bigger chat items on mobile for easier tapping */
    .cp-chat-item { padding: 13px 16px; }

    .cp-avatar { width: 48px; height: 48px; font-size: 17px; }

    .cp-chat-name  { font-size: 14px; }
    .cp-chat-preview { font-size: 12px; margin-top: 4px; }

    /* Status bar smaller on mobile */
    .cp-status-bar { padding: 5px 14px; font-size: 10px; }
  }

  /* Desktop: hide the mobile header */
  @media (min-width: 769px) {
    .cp-mobile-header { display: none !important; }
  }
`;

function injectStyles() {
  if (document.getElementById("mcoe-chat-styles")) return;
  const tag = document.createElement("style");
  tag.id = "mcoe-chat-styles";
  tag.textContent = STYLES;
  document.head.appendChild(tag);
}

function getInitials(name) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function SkeletonRow() {
  return (
    <div className="cp-skeleton">
      <div className="cp-skel-avatar" />
      <div className="cp-skel-lines">
        <div className="cp-skel-line" style={{ width: "50%" }} />
        <div className="cp-skel-line" style={{ width: "75%" }} />
      </div>
    </div>
  );
}

// ── Back arrow SVG ────────────────────────────────────────────────────────────
function BackArrow() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
function ChatsPage({ user }) {
  const [chats, setChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    if (location.state?.selectedUser) setSelectedUser(location.state.selectedUser);
  }, [location.state]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get("/api/chat");
        setChats(res.data.map((chat) => ({ ...chat, unreadCount: 0 })));
      } catch { /* silent */ }
      finally { setChatsLoading(false); }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    if (!showUsers) return;
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const res = await api.get("/api/users");
        setUsers(res.data);
      } catch {
        alert("Failed to fetch users. Please try again.");
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, [showUsers]);

  const handleReceiveMessage = useCallback(
    (data) => {
      setChats((prev) =>
        prev.map((chat) => {
          if (chat._id !== data.chatId) return chat;
          const isOpen =
            selectedUser &&
            (selectedUser._id === data.sender || selectedUser._id === data.receiver);
          return {
            ...chat,
            lastMessage: { text: data.text, createdAt: data.createdAt },
            unreadCount:
              data.sender !== user._id && !isOpen
                ? chat.unreadCount + 1
                : chat.unreadCount,
          };
        })
      );
    },
    [selectedUser, user._id]
  );

  useEffect(() => {
    socket.on("receive_message", handleReceiveMessage);
    return () => { socket.off("receive_message", handleReceiveMessage); };
  }, [handleReceiveMessage]);

  useEffect(() => {
    const onOnlineUsers = (list) => setOnlineUsers(list);
    const onUserOnline  = (id)   => setOnlineUsers((p) => [...new Set([...p, id])]);
    const onUserOffline = (id)   => setOnlineUsers((p) => p.filter((u) => u !== id));

    socket.on("online_users", onOnlineUsers);
    socket.on("user_online",  onUserOnline);
    socket.on("user_offline", onUserOffline);

    return () => {
      socket.off("online_users", onOnlineUsers);
      socket.off("user_online",  onUserOnline);
      socket.off("user_offline", onUserOffline);
    };
  }, []);

  const isOnline = (id) => onlineUsers.includes(id);

  // When a user is selected on mobile, slide to chat view
  const openChat = (u) => {
    setSelectedUser(u);
    setShowUsers(false);
  };

  // Back button — return to conversation list on mobile
  const closeChat = () => setSelectedUser(null);

  // CSS class helpers for mobile slide animation
  const chatOpen = !!selectedUser;

  return (
    <div className="cp-root nb-page-offset">

      {/* ── Status bar ── */}
      <div className="cp-status-bar">
        <span className="dot" />
        {onlineUsers.length} online · MCOEgram Messenger
      </div>

      <div className="cp-layout">

        {/* ════════════════════════════════════════
            CONVERSATION LIST PANEL
        ════════════════════════════════════════ */}
        <aside className={`cp-sidebar${chatOpen ? " chat-open" : ""}`}>
          <div className="cp-sidebar-header">
            <div className="cp-sidebar-title">
              <span className="icon">💬</span>
              Messages
            </div>
            <button
              className="cp-new-chat-btn"
              onClick={() => setShowUsers((v) => !v)}
            >
              {showUsers ? "✕ Cancel" : "+ New Chat"}
            </button>
          </div>

          {/* User picker */}
          {showUsers && (
            <div className="cp-user-picker">
              <p className="cp-user-picker-label">Start a conversation</p>
              <div className="cp-picker-wrap">
                {usersLoading ? (
                  [0, 1, 2].map((i) => <SkeletonRow key={i} />)
                ) : users.filter((u) => u._id !== user._id).length === 0 ? (
                  <p className="cp-no-content">No other students found.</p>
                ) : (
                  users
                    .filter((u) => u._id !== user._id)
                    .map((u) => (
                      <div
                        key={u._id}
                        className="cp-user-pick-item"
                        onClick={() => openChat(u)}
                      >
                        <div className="avatar">{getInitials(u.name)}</div>
                        <span className="name">{u.name}</span>
                        {isOnline(u._id) && (
                          <span style={{ color: "var(--mcoe-online)", fontSize: 11 }}>● online</span>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Chat list */}
          <div className="cp-chat-list">
            {chatsLoading ? (
              [0, 1, 2, 3].map((i) => <SkeletonRow key={i} />)
            ) : chats.length === 0 ? (
              <p className="cp-no-content">No chats yet. Start one above!</p>
            ) : (
              chats.map((chat) => {
                const other = chat.participants.find(
                  (p) => p._id.toString() !== user._id.toString()
                );
                if (!other) return null;
                const active = selectedUser?._id === other._id;

                return (
                  <div
                    key={chat._id}
                    className={`cp-chat-item${active ? " active" : ""}`}
                    onClick={() => openChat(other)}
                  >
                    <div className="cp-avatar">
                      {getInitials(other.name)}
                      {isOnline(other._id) && <span className="online-dot" />}
                    </div>

                    <div className="cp-chat-info">
                      <div
                        className="cp-chat-name"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${other._id}`);
                        }}
                      >
                        {other.name}
                      </div>
                      <div className="cp-chat-preview">
                        {chat.lastMessage?.text
                          ? chat.lastMessage.text.slice(0, 30) +
                            (chat.lastMessage.text.length > 30 ? "…" : "")
                          : "No messages yet"}
                      </div>
                    </div>

                    {chat.unreadCount > 0 && (
                      <span className="cp-unread-badge">{chat.unreadCount}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ════════════════════════════════════════
            CHAT PANEL
        ════════════════════════════════════════ */}
        <main className={`cp-main${chatOpen ? " chat-open" : ""}`}>

          {selectedUser ? (
            <>
              {/* Mobile header: back button + user info */}
              <div className="cp-mobile-header">
                <button className="cp-back-btn" onClick={closeChat} aria-label="Back">
                  <BackArrow />
                </button>
                <div className="cp-mobile-user-info">
                  <div className="cp-mobile-avatar">
                    {getInitials(selectedUser.name)}
                    {isOnline(selectedUser._id) && <span className="online-dot" />}
                  </div>
                  <div>
                    <div
                      className="cp-mobile-name"
                      onClick={() => navigate(`/profile/${selectedUser._id}`)}
                    >
                      {selectedUser.name}
                    </div>
                    {isOnline(selectedUser._id) && (
                      <div className="cp-mobile-status">● Active now</div>
                    )}
                  </div>
                </div>
              </div>

              <Chat
                currentUser={user}
                selectedUserName={selectedUser.name}
                selectedUserID={selectedUser._id}
                receiverId={selectedUser._id}
              />
            </>
          ) : (
            /* Desktop empty state — hidden on mobile since list is shown instead */
            <div className="cp-empty-state">
              <div className="cp-empty-icon">💬</div>
              <p>Pick a conversation</p>
              <span>Select a chat from the sidebar or start a new one</span>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

export default ChatsPage;