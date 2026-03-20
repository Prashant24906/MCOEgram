import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import api from "./api/axios";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";
import ChatsPage from "./pages/ChatPage";
import UpdateProfile from './pages/UpdateProfile'
import PostsPage from "./pages/PostsPage";
import Posts from "./pages/Posts";
import ArticlesPage from "./pages/ArticlesPage";
import socket from "./sockets";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await api.get("/api/users/me");
        setUser(res.data);
      } catch (err) {
        alert("Not logged in");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      socket.auth = {
        token: localStorage.getItem("token"),
      };

      socket.connect();
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  if (loading) return <div>Backend is starting Please wait....</div>;

  return (
    <>

      {user && <Navbar />}
      <Routes>
        <Route
          exact
          path="/ArticlesPage"
          element={(user) ? (<ArticlesPage user={user} />) : <Login setUser={setUser} />}
        />
          <Route path="/UpdateProfile" element={<UpdateProfile/>} />
        <Route
          exact
          path="/"
          element={user ? <ArticlesPage user={user} /> : <Login setUser={setUser} />}
        />
        <Route
          exact
          path="/PostsPage"
          element={user ? <PostsPage user={user} /> : <Login setUser={setUser} />}
        />
        <Route exact path="/login" element={<Login setUser={setUser} />} />
        <Route
          exact
          path="/chats"
          element={
            user ? <ChatsPage user={user} /> : <Login setUser={setUser} />
          }
        />
        <Route
          path="/profile/:userId"
          element={<Profile currentUser={user} />}
        />
        <Route
          path="/profile/:userId/Articles"
          element={<Posts currentUser={user} />}
        />

        <Route path="/me" element={<Profile currentUser={user} />} />
      </Routes>
    </>
  );
}
export default App;
