import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import "../main.css";
import "./feed.css";

function Feed({ user }) {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await api.get("/api/posts");
      setPosts(res.data);
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

        <div className="posts-container">
          {posts.map((post) => {
            const isLiked = post.likes.includes(user._id);

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
                    <span className="action-text">{post.comments.length}</span>
                  </button>
                </div>
              </article>
            );
          })}
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
    </div>
  );
}

export default Feed;
