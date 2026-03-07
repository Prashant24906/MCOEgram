import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import "./ProfilePage.css";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";

function Profile({ currentUser }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [Credentials, setCredentials] = useState({ name: "", bio: "" });

  const effectiveUserId = userId || currentUser?._id;
  const isOwnProfile = currentUser?._id === effectiveUserId;

  // Fetch Profile + Posts
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

  // Prefill edit modal
  useEffect(() => {
    if (profileUser) {
      setCredentials({
        name: profileUser.name || "",
        bio: profileUser.bio || "",
      });
    }
  }, [profileUser]);

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
    <div className="profile-container">
      {/* HEADER */}
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
              <h1 className="profile-name">{profileUser.name}</h1>

              {isOwnProfile ? (
                <button
                  className="action-button edit-button"
                  data-bs-toggle="modal"
                  data-bs-target="#EditProfile"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  className="action-button message-button"
                  onClick={navigateToChat}
                >
                  Message
                </button>
              )}
            </div>

            <p className="profile-bio">{profileUser.bio || "No bio yet"}</p>

            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">{posts.length}</span>
                <span className="stat-label">Posts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* POSTS GRID */}
      <div className="posts-section">
        <h2 className="posts-title">Posts</h2>

        {posts.length > 0 ? (
          <div className="profile-posts-grid">
            {posts.map((post) => {
              const isLiked = post.likes.includes(currentUser._id);
              return (
                <article key={post._id} className="profile-post-card">
                  <div className="post-header">
                    <div className="user-info">
                      <img
                        src={post.user.profilePic}
                        alt={post.user.name}
                        className="user-avatar"
                      />
                      <div className="user-details">
                        <Link
                          to={`/profile/${post.user._id}`}
                          className="username"
                        >
                          {post.user.name}
                        </Link>
                      </div>
                    </div>

                    {post.user._id === currentUser._id && (
                      <div className="dropdown">
                        <button
                          className="menu-button"
                          data-bs-toggle="dropdown"
                        >
                          <MoreHorizontal size={20} />
                        </button>
                        <ul className="dropdown-menu">
                          <li
                            className="dropdown-item"
                            onClick={async () => {
                              await api.delete(`/api/posts/delete/${post._id}`);
                              setPosts((prev) =>
                                prev.filter((p) => p._id !== post._id),
                              );
                            }}
                          >
                            Delete
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                  {/* <div className="post-image-wrapper"> */}
                  <img src={post.imageUrl} className="post-image" />
                  {/* </div> */}

                  <div className="post-caption">
                    <p className="caption-text">
                      <strong>{post.user.name}</strong> {post.caption}
                    </p>
                  </div>

                  <div className="post-actions">
                    <button
                      className={`action-button like-button ${
                        isLiked ? "liked" : ""
                      }`}
                      onClick={() => toggleLike(post._id)}
                    >
                      <Heart
                        size={20}
                        className={isLiked ? "heart-filled" : ""}
                      />
                      <span className="action-text">{post.likes.length}</span>
                    </button>

                    <button
                      className="action-button comment-button"
                      data-bs-toggle="modal"
                      data-bs-target="#commentModal"
                      onClick={() => setSelectedPost(post)}
                    >
                      <MessageCircle size={20} />
                      <span className="action-text">
                        {post.comments.length}
                      </span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>No posts yet</p>
          </div>
        )}
      </div>
      <div className="modal fade" id="commentModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Comments</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              {selectedPost && (
                <>
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Add comment..."
                    onKeyDown={async (e) => {
                      if (e.key === "Enter" && e.target.value.trim()) {
                        const res = await api.post(
                          `/api/posts/${selectedPost._id}/comment`,
                          { text: e.target.value },
                        );

                        setPosts((prev) =>
                          prev.map((p) =>
                            p._id === selectedPost._id
                              ? {
                                  ...p,
                                  comments: [res.data, ...p.comments],
                                }
                              : p,
                          ),
                        );

                        setSelectedPost((prev) => ({
                          ...prev,
                          comments: [res.data, ...prev.comments],
                        }));

                        e.target.value = "";
                      }
                    }}
                  />

                  {selectedPost.comments.map((comment) => (
                    <div key={comment._id}>
                      <strong>{comment.user.name}</strong>: {comment.text}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* EDIT PROFILE MODAL */}
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

            <div className="modal-body">
              <input
                type="text"
                name="name"
                value={Credentials.name}
                onChange={onChange}
                className="form-control mb-3"
                placeholder="Name"
              />

              <input
                type="text"
                name="bio"
                value={Credentials.bio}
                onChange={onChange}
                className="form-control"
                placeholder="Bio"
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
  );
}

export default Profile;
