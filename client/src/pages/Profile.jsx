import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import "../main.css";
function Profile({ currentUser }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const ref = useRef(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const effectiveUserId = userId || currentUser?._id;
  const isOwnProfile = currentUser?._id === effectiveUserId;
  const [Credentials, setCredentials] = useState({ name: "", bio: "" });

  const onChange = (e) => {
    setCredentials({ ...Credentials, [e.target.name]: e.target.value });
  };

  const navigateToChat = () => {
    navigate("/chats", {
      state: { selectedUser: profileUser },
    });
  };

  useEffect(() => {
    if (profileUser) {
      setCredentials({
        name: profileUser.name || "",
        bio: profileUser.bio || "",
      });
    }
  }, [profileUser]);

  // Single clean useEffect
  useEffect(() => {
    if (!currentUser) return;

    const id = userId || currentUser._id;

    const fetchProfileData = async () => {
      try {
        const [userRes, postRes] = await Promise.all([
          api.get(`/api/users/${id}`),
          api.get(`/api/posts`),
        ]);

        setProfileUser(userRes.data);

        // Proper filtering by user id
        const filteredPosts = postRes.data.filter(
          (post) => post.user && post.user._id === id,
        );

        setPosts(filteredPosts);
      } catch (err) {
        alert(err);
      }
    };

    fetchProfileData();
  }, [userId, currentUser]);

  const EditProfile = async () => {
    const response = await api.put("api/users/update", Credentials);
    setProfileUser((prev) => ({
      ...prev,
      name: response.data.name,
      bio: response.data.bio,
    }));
  };
  if (!profileUser) return <div>Loading profile...</div>;

  return (
    <div style={{ padding: "30px" }}>
      {/* Profile Header */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <img
          src={profileUser.profilePic}
          alt="profile"
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
          }}
        />

        <div>
          <h2>{profileUser.name}</h2>
          <p>{profileUser.bio || "No bio yet"}</p>
          <p>
            <strong>{posts.length}</strong> posts
          </p>

          {isOwnProfile ? (
            <button
              data-bs-toggle="modal"
              data-bs-target="#EditProfile"
              style={{
                padding: "8px 16px",
                backgroundColor: "#333",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={navigateToChat}
              style={{
                padding: "8px 16px",
                backgroundColor: "#25D366",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Message
            </button>
          )}
        </div>
      </div>
      <div className="Profile">
        {posts.map((post) => (
          <div className="Post" key={post._id} style={{ marginBottom: "20px" }}>
            <div>
              <div className="">
                <div className="Feed-Post-header">
                  <img
                    className="user-logo-profile"
                    src={post.user.profilePic}
                    width="40"
                    style={{ borderRadius: "50%"}}
                  />
                  <strong>
                    <span className=" UserName">
                      <Link to={`/profile/${post.user._id}`}>
                        {post.user.name}
                      </Link>
                    </span>
                  </strong>
                  
                    {isOwnProfile&&<div className="dropdown">
                      <button
                        className="more"
                        type="button"
                        style={{ border: "none", background: 0 }}
                        data-bs-toggle="dropdown"
                      >
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                      </button>
                      <ul className="dropdown-menu">
                        <li
                          className="dropdown-item"
                          onClick={async () => {
                            try {
                              await api.delete(`/api/posts/delete/${post._id}`);
                            } catch (err) {
                              alert("Like failed:", err);
                            }
                          }}
                        >
                          Delete
                        </li>
                      </ul>
                    </div>}
                  
                </div>
                <div className="card-body">
                  <img
                    src={post.imageUrl}
                    width="300px"
                    height="200px"
                    style={{ display: "block", marginTop: "10px" }}
                  />
                  <h5 className="card-title d-flex CaptionBox">
                    <p className="CaptionName">{post.user.name}: </p>
                    <p className="Caption">{post.caption}</p>
                  </h5>
                  <div className="FooterPost">
                    <button
                      className="LikeButton"
                      onClick={async () => {
                        const updatedPosts = posts.map((p) => {
                          if (p._id === post._id) {
                            const alreadyLiked = p.likes.includes(
                              currentUser._id,
                            );

                            return {
                              ...p,
                              likes: alreadyLiked
                                ? p.likes.filter((id) => id !== currentUser._id)
                                : [...p.likes, currentUser._id],
                            };
                          }
                          return p;
                        });

                        setPosts(updatedPosts);

                        try {
                          await api.put(`/api/posts/${post._id}/like`);
                        } catch (err) {
                          alert("Like failed:", err);
                        }
                      }}
                    >
                      <i
                        className={
                          post.likes.includes(currentUser._id)
                            ? "fa-solid fa-thumbs-up"
                            : "fa-regular fa-thumbs-up"
                        }
                      ></i>{" "}
                      {post.likes.length}
                    </button>
                    <button
                      className="CommentBox"
                      data-bs-toggle="modal"
                      data-bs-target="#commentModal"
                      onClick={() => setSelectedPost(post)}
                    >
                      <i className="fa-regular fa-comment"></i>
                      {post.comments.length}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div
          className="modal fade"
          id="commentModal"
          tabIndex="-1"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Comments</h5>
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
                                ? { ...p, comments: [res.data, ...p.comments] }
                                : p,
                            ),
                          );

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
        <div
          className="modal fade"
          id="EditProfile"
          tabIndex="-1"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>

              <div className="modal-body UpdateBio">
                <span>Name:</span>
                <input
                  placeholder="Minimun length should be 5 characters"
                  type="text"
                  onChange={onChange}
                  name="name"
                  id="name"
                  value={Credentials.name}
                />
              </div>
              <div className="modal-body UpdateBio">
                <span>Bio:</span>
                <input
                  type="text"
                  onChange={onChange}
                  name="bio"
                  id="bio"
                  value={Credentials.bio}
                />
              </div>
              <button onClick={EditProfile} data-bs-dismiss="modal">
                <span>Update</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
