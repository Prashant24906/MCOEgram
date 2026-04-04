import { useEffect, useState, useRef, useCallback } from "react";
import socket from "../sockets";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../main.css";
import "../style/Chat.css";

function Chat({ currentUser, selectedUserName, selectedUserID, selectedUserPic, isOnline, receiverId }) {
  const messagesEndRef = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  const getInitials = (name = "") =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // ── Fetch messages for selected conversation ──
  const fetchMessages = useCallback(async () => {
    if (!receiverId) return;
    try {
      const res = await api.get(`/api/chat/${receiverId}`);
      setMessages(res.data);
    } catch (err) {
      alert("Error fetching messages: " + err);
    }
  }, [receiverId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ── Notify server that this chat is open (marks messages seen) ──
  useEffect(() => {
    if (!receiverId) return;
    socket.emit("chat_opened", { receiverId });
  }, [receiverId]);

  // ── Auto-scroll to bottom on new messages ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Socket listeners ──
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      setMessages((prev) => {
        if (prev.some((msg) => msg._id === data._id)) return prev;
        return [...prev, data];
      });
    };

    const handleDelivered = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, delivered: true } : msg
        )
      );
    };

    const handleSeen = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, seen: true } : msg
        )
      );
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_delivered", handleDelivered);
    socket.on("message_seen", handleSeen);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_delivered", handleDelivered);
      socket.off("message_seen", handleSeen);
    };
  }, []);

  // ── Send message ──
  const sendMessage = () => {
    if (!message.trim() || !receiverId) return;
    socket.emit("send_message", { receiverId, text: message });
    setMessage("");
    // No fetchMessages() here — the socket receive_message event updates state
  };

  // ─── Bubble styles (explicit colors so they're never overridden by parent theme) ───

  const sentBubble = {
    alignSelf: "flex-end",
    backgroundColor: "#dcf8c6",
    color: "#111827",           // ← explicit dark text on green bubble
    padding: "8px 12px",
    borderRadius: "12px 12px 2px 12px",
    maxWidth: "60%",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
  };

  const receivedBubble = {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    color: "#111827",           // ← explicit dark text on white bubble
    padding: "8px 12px",
    borderRadius: "12px 12px 12px 2px",
    maxWidth: "60%",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
  };

  const timestampStyle = {
    fontSize: "11px",
    marginTop: "4px",
    color: "#6b7280",           // ← explicit gray, never inherits light theme color
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "4px",
  };

  return (
    <div className="Chat-layout" style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* ── Enhanced Header ── */}
      <div className="chat-header">

        {/* Avatar with online indicator */}
        <div className="chat-header-avatar-wrap">
          {selectedUserPic ? (
            <img
              src={selectedUserPic}
              alt={selectedUserName}
              className="chat-header-avatar"
            />
          ) : (
            <div className="chat-header-avatar-initials">
              {getInitials(selectedUserName)}
            </div>
          )}
          {isOnline && <span className="chat-header-online-dot" />}
        </div>

        {/* Name + online status */}
        <div className="chat-header-info">
          <div
            className="chat-header-name"
            onClick={() => navigate(`/profile/${selectedUserID}`)}
            title="View profile"
          >
            {selectedUserName}
          </div>
          <div className={`chat-header-status${isOnline ? "" : " offline"}`}>
            <span className="chat-header-status-dot" />
            {isOnline ? "Active now" : "Offline"}
          </div>
        </div>

        {/* Profile shortcut button */}
        <button
          className="chat-header-profile-btn"
          onClick={() => navigate(`/profile/${selectedUserID}`)}
          title="View profile"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Profile
        </button>
      </div>

      {/* ── Messages area ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "15px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg._id}
            style={msg.sender === currentUser._id ? sentBubble : receivedBubble}
          >
            <div style={{ wordBreak: "break-word" }}>{msg.text}</div>

            <div style={timestampStyle}>
              <span>{formatTime(msg.createdAt)}</span>

              {msg.sender === currentUser._id && (
                <span>
                  {msg.seen ? (
                    <span style={{ color: "#34B7F1" }}>✓✓</span>
                  ) : msg.delivered ? (
                    <span>✓✓</span>
                  ) : (
                    <span>✓</span>
                  )}
                </span>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input bar ── */}
      <div
        style={{
          display: "flex",
          padding: "10px",
          backgroundColor: "#111840",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.15)",
            outline: "none",
            backgroundColor: "#1e2d54",
            color: "#e8eaf2",             // ← light text inside dark input
            fontSize: "14px",
          }}
        />

        <button
          onClick={sendMessage}
          style={{
            padding: "10px 20px",
            borderRadius: "20px",
            border: "none",
            backgroundColor: "#25D366",
            color: "white",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "14px",
            flexShrink: 0,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#1ebe5a")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#25D366")}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;