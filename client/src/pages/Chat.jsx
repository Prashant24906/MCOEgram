import { useEffect, useState, useRef } from "react";
import socket from "../sockets";
import { Link ,useNavigate} from "react-router-dom";
import api from "../api/axios";
import "../main.css";
function Chat({ currentUser, selectedUserName, selectedUserID, receiverId }) {
  const messagesEndRef = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const history = useNavigate(null);

  // format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // socket listner
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      setMessages((prev) => {
        const exists = prev.some((msg) => msg._id === data._id);
        if (exists) return prev;
        return [...prev, data];
      });
    };

    const handleDelivered = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, delivered: true } : msg,
        ),
      );
    };

    const handleSeen = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, seen: true } : msg,
        ),
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

  //  MARK CHAT OPENED 
  useEffect(() => {
    if (!receiverId) return;
    socket.emit("chat_opened", { receiverId });
  }, [receiverId]);

  // auto scroll after msg is sent 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // older messages fetching
  useEffect(() => {
    if (!receiverId) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/api/chat/${receiverId}`);
        setMessages(res.data);
      } catch (err) {
        alert("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [receiverId]);

const sendMessage = () => {
  if (!message.trim() || !receiverId) return;

  socket.emit("send_message", {
    receiverId,
    text: message,
  });

  setMessage("");
};

  return (
    <>
    
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#e5ddd5",
      }}
    >
     
      <div
        style={{
          padding: "15px",
          backgroundColor: "white",
          borderBottom: "1px solid #ddd",
          fontWeight: "bold",
        }}
      >
        <Link to={`/profile/${selectedUserID}`}>{selectedUserName}</Link>
      </div>


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
            style={{
              alignSelf:
                msg.sender === currentUser._id ? "flex-end" : "flex-start",
              backgroundColor:
                msg.sender === currentUser._id ? "#dcf8c6" : "white",
              padding: "8px 12px",
              borderRadius: "12px",
              maxWidth: "60%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div>{msg.text}</div>

            <div
              style={{
                fontSize: "11px",
                marginTop: "4px",
                textAlign: "right",
                color: "gray",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>{formatTime(msg.createdAt)}</span>

              {msg.sender === currentUser._id && (
                <span>
                  {msg.seen ? (
                    <span style={{ color: "#34B7F1" }}>✓✓</span>
                  ) : msg.delivered ? (
                    "✓✓"
                  ) : (
                    "✓"
                  )}
                </span>
              )}
            </div>
          </div>
        ))}

        
        <div ref={messagesEndRef} />
      </div>

     
      <div
        style={{
          display: "flex",
          padding: "10px",
          backgroundColor: "white",
          borderTop: "1px solid #ddd",
        }}
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "20px",
            border: "1px solid #ccc",
            outline: "none",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />

        <button
          onClick={sendMessage}
          style={{
            marginLeft: "10px",
            padding: "8px 16px",
            borderRadius: "20px",
            border: "none",
            backgroundColor: "#25D366",
            color: "white",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
    </>
  );
}

export default Chat;
