import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import "../main.css";
import "./feed.css";

function Feed({ user }) {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [image, setImage] = useState(null);
  const [Caption, setCaption] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("caption", Caption);

      const res = await api.post("/api/posts", formData);

      setPosts((prev) =>
        Array.isArray(prev) ? [res.data, ...prev] : [res.data],
      );

      setCaption("");
      setImage(null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await api.get("/api/posts");

      if (Array.isArray(res.data)) {
        setPosts(res.data);
      } else {
        setPosts([]); // fallback safety
      }
    };

    fetchPosts();
  }, []);

  const toggleLike = async (postId) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post._id === postId) {
          const alreadyLiked = post.likes.includes(user._id);
          return {
            ...post,
            likes: alreadyLiked
              ? post.likes.filter((id) => id !== user._id)
              : [...post.likes, user._id],
          };
        }
        return post;
      }),
    );

    try {
      await api.put(`/api/posts/${postId}/like`);
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  return (
    <div className="feed-container">
      <div className="feed-wrapper">
        <div className="feed-header">
          <div className="header-content">
            <h1 className="header-title">MCOEGRAM</h1>
            <p className="header-subtitle">
              Connect and share with your college
            </p>
          </div>
        </div>
        <button
          className="Add-article"
          data-bs-toggle="modal"
          data-bs-target="#AddPost"
        >
          Add Post
        </button>
        <div className="posts-container">
          {posts.map((post) => {
            const isLiked = post.likes?.includes(user._id);

            return (
              <article key={post._id} className="post-card">
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

                  {post.user._id === user._id && (
                    <div className="dropdown">
                      <button className="menu-button" data-bs-toggle="dropdown">
                        <MoreHorizontal size={20} />
                      </button>
                      <ul className="dropdown-menu">
                        <li
                          type="button"
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
                    <span className="action-text">{post.comments?post.comments.length:0}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      {/* Add Post */}
      <div className="AddArticle">
        <div className="modal fade" id="AddPost">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Add Post</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>

              <div className="modal-body">
                <input
                  type="file"
                  onChange={(e) => setImage(e.target.files[0])}
                />
                <input
                  type="text"
                  placeholder="Caption"
                  value={Caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  data-bs-dismiss="modal"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
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
                  {/* Add Comment Input */}
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
                                  comments: [res.data, ...(p.comments || [])],
                                }
                              : p,
                          ),
                        );

                        setSelectedPost((prev) => ({
                          ...prev,
                          comments: [res.data, ...(prev.comments || [])],
                        }));

                        e.target.value = "";
                      }
                    }}
                  />

                  {/* Comments List */}
                  {selectedPost.comments?.length > 0 ? (
                    selectedPost.comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="d-flex justify-content-between align-items-start mb-2 p-2 border rounded"
                      >
                        <div>
                          <strong>{comment.user.name}</strong>
                          <div>{comment.text}</div>
                        </div>

                        {/* Show delete button only if current user's comment */}
                        {comment.user._id === user._id && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={async () => {
                              // Optimistic UI removal
                              setPosts((prev) =>
                                prev.map((p) =>
                                  p._id === selectedPost._id
                                    ? {
                                        ...p,
                                        comments: p.comments.filter(
                                          (c) => c._id !== comment._id,
                                        ),
                                      }
                                    : p,
                                ),
                              );

                              setSelectedPost((prev) => ({
                                ...prev,
                                comments: prev.comments.filter(
                                  (c) => c._id !== comment._id,
                                ),
                              }));

                              try {
                                await api.delete(
                                  `/api/posts/delete/${selectedPost._id}/comment/${comment._id}`,
                                );
                              } catch (err) {
                                console.error("Delete failed", err);
                              }
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No comments yet</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feed;
