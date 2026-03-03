import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import Chat from "./Chat";
import socket from "../sockets";
import { useLocation } from "react-router-dom";
import "../main.css"

function ChatsPage({ user }) {
  const location = useLocation();
  const [chats, setChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
  const handleReceive = (data) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat._id === data.chatId) {
          const isCurrentChatOpen =
            selectedUser && selectedUser._id === data.sender;

          return {
            ...chat,
            lastMessage: {
              text: data.text,
              createdAt: data.createdAt,
            },
            unreadCount:
              data.sender !== user._id && !isCurrentChatOpen
                ? chat.unreadCount + 1
                : chat.unreadCount,
          };
        }
        return chat;
      })
    );
  };

  socket.on("receive_message", handleReceive);

  return () => socket.off("receive_message", handleReceive);
}, [selectedUser, user]);

  useEffect(() => {
    if (location.state?.selectedUser) {
      setSelectedUser(location.state.selectedUser);
    }
  }, [location.state]);

  useEffect(() => {
    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("user_online", (userId) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    });

    socket.on("user_offline", (userId) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    return () => {
      socket.off("online_users");
      socket.off("user_online");
      socket.off("user_offline");
    };
  }, []);

  const fetchUsers = async () => {
    const res = await api.get("/api/users");
    setUsers(res.data);
  };

  socket.on("receive_message", (data) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat._id === data.chatId) {
          const isCurrentChatOpen =
            selectedUser &&
            (selectedUser._id === data.sender ||
              selectedUser._id === data.receiver);

          return {
            ...chat,
            lastMessage: {
              text: data.text,
              createdAt: data.createdAt,
            },
            unreadCount:
              data.sender !== user._id && !isCurrentChatOpen
                ? chat.unreadCount + 1
                : chat.unreadCount,
          };
        }

        return chat;
      }),
    );
  });

  useEffect(() => {
    if (showUsers) {
      const fetchUsers = async () => {
        try {
          const res = await api.get("/api/users");
          setUsers(res.data);
        } catch (err) {
          alert("Failed to fetch users Please try again")
        }
      };

      fetchUsers();
    }
  }, [showUsers]);
  useEffect(() => {
    const fetchChats = async () => {
      const res = await api.get("/api/chat");
      setChats(
        res.data.map((chat) => ({
          ...chat,
          unreadCount: 0,
        })),
      );
    };

    fetchChats();
  }, []);
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "30%",
          backgroundColor: "white",
          borderRight: "1px solid #ddd",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3>Chats</h3>
        <button
          onClick={() => {
            setShowUsers(true);
          }}
        >
          + New Chat
        </button>
        {showUsers && (
          <div style={{ marginTop: "10px" }}>
            {users.length === 0 && <p>No users found</p>}

            {users
              .filter((u) => u._id !== user._id)
              .map((user) => (
                <div
                  key={user._id}
                  style={{
                    cursor: "pointer",
                    padding: "8px",
                    borderBottom: "1px solid #ccc",
                  }}
                  onClick={() => {
                    setSelectedUser(user);
                    setShowUsers(false);
                  }}
                >
                  <strong>
                    {user.name}

                    {chats.unreadCount > 0 && (
                      <span
                        style={{
                          backgroundColor: "#25D366",
                          color: "white",
                          borderRadius: "12px",
                          padding: "2px 6px",
                          fontSize: "12px",
                          marginLeft: "6px",
                        }}
                      >
                        {chat.unreadCount}
                      </span>
                    )}
                  </strong>
                </div>
              ))}
          </div>
        )}
        {chats.map((chat) => {
          const otherUser = chat.participants.find(
            (p) => p._id.toString() !== user._id.toString(),
          );
          if (!otherUser) return null;

          return (
            <div
              key={chat._id}
              style={{ padding: "10px", cursor: "pointer" }}
              onClick={() => setSelectedUser(otherUser)}
            >
              <strong>
                <Link to={`/profile/${otherUser._id}`}>{otherUser.name}</Link>
                {onlineUsers.some((id) => id === otherUser._id.toString()) && (
                  <span style={{ color: "green", marginLeft: "6px" }}>●</span>
                )}
              </strong>

              <p style={{ fontSize: "12px", color: "gray" }}>
                {chat.lastMessage?.text || "No messages yet"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1 }}>
        {selectedUser && (
          <Chat
            currentUser={user}
            selectedUserName={selectedUser.name}
            selectedUserID={selectedUser._id}
            receiverId={selectedUser._id}
          />
        )}
      </div>
    </div>
  );
}

export default ChatsPage;
