import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import Chat from "./Chat";
import { Link } from "react-router-dom";
import "../main.css";

function Feed({ user }) {
  const [posts, setPosts] = useState([]);
  const ref = useRef(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [Liked, notLiked] = useState(false);
  useEffect(() => {
    const fetchPosts = async () => {
      const res = await api.get("/api/posts");
      setPosts(res.data);
    };

    fetchPosts();
  }, []);

  const OpenComment = () => {
    ref.current.click();
  };

  return (
    <div className="container d-flex flex-column align-items-center ">
      <button
        type="button"
        className="btn btn-primary d-none"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal"
        ref={ref}
      >
        Launch demo modal
      </button>
      <div className="Feed">
        {posts.map((post) => (
          <div className="Post" key={post._id} style={{ marginBottom: "20px" }}>
            <div>
              <div className="">
                <div className="Feed-Post-header">
                  <div className="Feed-Post-First">
                    <img
                      className="user-logo"
                      src={post.user.profilePic}
                      width="40"
                      style={{ borderRadius: "50%" }}
                    />
                    <strong>
                      <span className=" UserName">
                        <Link to={`/profile/${post.user._id}`}>
                          {post.user.name}
                        </Link>
                      </span>
                    </strong>
                  </div>
                  <div className="Feed-Post-Second">
                    {post.user._id === user._id && (
                      <div className="dropdown">
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
                                await api.delete(
                                  `/api/posts/delete/${post._id}`,
                                );
                              } catch (err) {
                                alert("Like failed:", err);
                              }
                            }}
                          >
                            Delete
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-body">
                  <img
                    src={post.imageUrl}
                    width="350"
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
                            const alreadyLiked = p.likes.includes(user._id);

                            return {
                              ...p,
                              likes: alreadyLiked
                                ? p.likes.filter((id) => id !== user._id)
                                : [...p.likes, user._id],
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
                          post.likes.includes(user._id)
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
    </div>
  );
}

export default Feed;
