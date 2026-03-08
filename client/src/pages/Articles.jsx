import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import "../style/Articles.css";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import Navbar from "../components/Navbar";
function Articles({ user }) {
  const { userId } = useParams();
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setselectedArticle] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [Caption, setcaption] = useState("");
  const effectiveUserId = userId || user?._id;
  useEffect(() => {
    const fetchProfileData = async () => {
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
    fetchProfileData();
  }, []);

  const PostArticle = async () => {
    const response = await api.post("/api/posts/article", {
      caption: Caption,
    });
    setArticles((prev) => [response.data, ...prev]);
    setcaption("");
  };

  const onChange = (e) => {
    setcaption(e.target.value);
  };

  const toggleArticleLike = async (articleId) => {
    setArticles((prev) =>
      prev.map((article) => {
        if (article._id === articleId) {
          const alreadyLiked = article.likes?.includes(user._id);
          return {
            ...article,
            likes: alreadyLiked
              ? article.likes.filter((id) => id !== user._id)
              : [...article.likes, user._id],
          };
        }
        return article;
      }),
    );

    try {
      await api.put(`/api/posts/article/${articleId}/like`);
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  return (
    <>
        
        <div className="Article-container">
          {articles.map((article) => {
            const isLiked = article.likes?.includes(user._id);

            return (
              <article key={article._id} className="article-card-profile">
                <div className="post-header-profile">
                  <div className="user-info">
                    <img
                      src={article.user.profilePic}
                      alt={article.user.name}
                      className="user-avatar"
                    />
                    <div className="user-details">
                      <Link
                        to={`/profile/${article.user._id}`}
                        className="username"
                      >
                        {article.user.name}
                      </Link>
                    </div>
                  </div>

                  {article.user._id === user._id && (
                    <div className="dropdown">
                      <button className="menu-button" data-bs-toggle="dropdown">
                        <MoreHorizontal size={20} />
                      </button>
                      <ul className="dropdown-menu">
                        <li
                          type="button"
                          className="dropdown-item Delete-Button"
                          onClick={async () => {
                            await api.delete(
                              `/api/posts/article/delete/${article._id}`,
                            );
                            setArticles((prev) =>
                              prev.filter((p) => p._id !== article._id),
                            );
                          }}
                        >
                          Delete
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                <div className="post-caption-profile">
                  <p className="caption-text">
                    <strong>{article.user.name}</strong> {article.caption}
                  </p>
                </div>

                <div className="post-actions">
                  <button
                    className={`action-button like-button ${
                      isLiked ? "liked" : ""
                    }`}
                    onClick={() => toggleArticleLike(article._id)}
                  >
                    <Heart
                      size={20}
                      className={isLiked ? "heart-filled" : ""}
                    />
                    <span className="action-text">
                      {article.likes?.length || 0}
                    </span>
                  </button>

                  <button
                    className="action-button comment-button"
                    data-bs-toggle="modal"
                    data-bs-target="#commentModal"
                    onClick={() => setselectedArticle(article)}
                  >
                    <MessageCircle size={20} />
                    <span className="action-text">
                      {article.comments?.length || 0}
                    </span>
                  </button>
                </div>
              </article>
            );
          })}
  
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
              {selectedArticle && (
                <>
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Add comment..."
                    onKeyDown={async (e) => {
                      if (e.key === "Enter" && e.target.value.trim()) {
                        const res = await api.post(
                          `/api/posts/article/${selectedArticle._id}/comment`,
                          { text: e.target.value },
                        );

                        setArticles((prev) =>
                          prev.map((p) =>
                            p._id === selectedArticle._id
                              ? {
                                  ...p,
                                  comments: [res.data, ...(p.comments || [])],
                                }
                              : p,
                          ),
                        );

                        setselectedArticle((prev) => ({
                          ...prev,
                          comments: [res.data, ...(prev.comments || [])],
                        }));

                        e.target.value = "";
                      }
                    }}
                  />

                  {selectedArticle.comments?.length > 0 ? (
                    selectedArticle.comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="d-flex justify-content-between align-items-start mb-2 p-2 border rounded"
                      >
                        <div>
                          <strong>{comment.user.name}</strong>
                          <div>{comment.text}</div>
                        </div>

                        {comment.user._id === user._id && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={async () => {
                              setArticles((prev) =>
                                prev.map((p) =>
                                  p._id === selectedArticle._id
                                    ? {
                                        ...p,
                                        comments: p.comments.filter(
                                          (c) => c._id !== comment._id,
                                        ),
                                      }
                                    : p,
                                ),
                              );

                              setselectedArticle((prev) => ({
                                ...prev,
                                comments: prev.comments.filter(
                                  (c) => c._id !== comment._id,
                                ),
                              }));

                              try {
                                await api.delete(
                                  `/api/posts/article/delete/${selectedArticle._id}/comment/${comment._id}`,
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
    </>
  );
}

export default Articles;
