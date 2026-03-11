import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import "../style/ProfilePage.css";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import Posts from "./Posts";
import Articles from "./Articles";
import Navbar from "../components/Navbar";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

function Profile({ currentUser }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [Credentials, setCredentials] = useState({
    name: "",
    bio: "",
    year: "",
    department: "",
  });
  const effectiveUserId = userId || currentUser?._id;
  const isOwnProfile = currentUser?._id === effectiveUserId;
  const [SelectedFeed, setSelectedFeed] = useState("Article");
  const [articles, setArticles] = useState([]);

  const Department = [
    { label: "CS" },
    { label: "IT" },
    { label: "MECH" },
    { label: "ENTC" },
    { label: "AIML" },
  ];
  const Year = [
    { label: "1st" },
    { label: "2nd" },
    { label: "3rd" },
    { label: "4th" },
  ];

  useEffect(() => {
    const fetchArticles = async () => {
      const [userRes, postRes] = await Promise.all([
        api.get(`/api/users/${effectiveUserId}`),
        api.get(`/api/posts/article`),
      ]);
      setProfileUser(userRes.data);
      const filteredPosts = postRes.data.filter(
        (article) => article.user && article.user._id === effectiveUserId,
      );
      setArticles(filteredPosts);
    };
    fetchArticles();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchProfileData = async () => {
      try {
        const [userRes, postRes] = await Promise.all([
          api.get(`/api/users/${effectiveUserId}`),
          api.get(`/api/posts`),
        ]);

        setProfileUser(userRes.data);

        const filteredPosts = postRes.data.filter(
          (post) => post.user && post.user._id === effectiveUserId,
        );

        setPosts(filteredPosts);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfileData();
  }, [effectiveUserId, currentUser]);

  useEffect(() => {
    if (profileUser) {
      setCredentials({
        name: profileUser.name || "",
        bio: profileUser.bio || "",
        department: profileUser.department || "",
        year: profileUser.year || "",
      });
    }
  }, [profileUser, currentUser]);

  const onChange = (e) => {
    setCredentials({ ...Credentials, [e.target.name]: e.target.value });
  };

  const EditProfile = async () => {
    try {
      const response = await api.put("/api/users/update", Credentials);
      setProfileUser(response.data);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const toggleLike = async (postId) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post._id === postId) {
          const alreadyLiked = post.likes.includes(currentUser._id);

          return {
            ...post,
            likes: alreadyLiked
              ? post.likes.filter((id) => id !== currentUser._id)
              : [...post.likes, currentUser._id],
          };
        }
        return post;
      }),
    );

    try {
      await api.put(`/api/posts/${postId}/like`);
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  const navigateToChat = () => {
    navigate("/chats", {
      state: { selectedUser: profileUser },
    });
  };

  if (!profileUser) return <div>Loading profile...</div>;

  return (
    <>
      {currentUser && <Navbar />}
      <div className="ProfileBody">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-header-content">
              <div className="profile-pic-wrapper">
                <img
                  src={profileUser.profilePic}
                  alt={profileUser.name}
                  className="profile-pic"
                />
              </div>

              <div className="profile-info">
                <div className="profile-top">
                  <h1 className="profile-name">
                    {"Name: " + profileUser.name}
                  </h1>
                  <h1 className="profile-name">
                    {"Year: " + profileUser.year}
                  </h1>
                  <h1 className="profile-name">
                    {"Department: " + profileUser.department}
                  </h1>
                </div>
                <p className="profile-bio">{profileUser.bio || "No bio yet"}</p>

                {isOwnProfile ? (
                  <button
                    className=" edit-profile-button"
                    data-bs-toggle="modal"
                    data-bs-target="#EditProfile"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    className="edit-profile-button"
                    onClick={navigateToChat}
                  >
                    Message
                  </button>
                )}

                <div className="profile-stats">
                  <div className="stat">
                    <span className="stat-value">{articles.length}</span>
                    <span className="stat-label">Articles</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{posts.length}</span>
                    <span className="stat-label">Posts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="feed-type">
            <button
              className="feed-type-inside"
              onClick={() => setSelectedFeed("Articles")}
            >
              Articles
            </button>
            <button
              className="feed-type-inside"
              onClick={() => setSelectedFeed("Posts")}
            >
              Posts
            </button>
          </div>
          {SelectedFeed === "Posts" ? (
            <div className="profile-posts">
              <Posts currentUser={currentUser} />
            </div>
          ) : (
            <div className="profile-article">
              <Articles user={currentUser} />
            </div>
          )}

          <div className="modal fade" id="EditProfile">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>Update Profile</h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                  ></button>
                </div>

                <div className="modal-body-profile">
                  <input
                    type="text"
                    name="name"
                    value={Credentials.name}
                    onChange={onChange}
                    className="form-control"
                    placeholder="Name"
                  />

                  <input
                    type="text"
                    name="bio"
                    value={Credentials.bio}
                    onChange={onChange}
                    required
                    className="form-control"
                    placeholder="Bio"
                  />

                  <Autocomplete
                    options={Year}
                    sx={{ width: 300 }}
                    value={Year.find((y) => y.label === Credentials.year) || null}
                    onChange={(event, value) =>
                      setCredentials({ ...Credentials, year: value?.label || "" })
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Year" />
                    )}
                  />
                  <Autocomplete
                    options={Department}
                    sx={{ width: 300 }}
                    value={
                      Department.find((d) => d.label === Credentials.department) ||
                      null
                    }
                    onChange={(event, value) =>
                      setCredentials({ ...Credentials, department: value?.label || "" })
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Department" />
                    )}
                  />
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-primary"
                    onClick={EditProfile}
                    data-bs-dismiss="modal"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
