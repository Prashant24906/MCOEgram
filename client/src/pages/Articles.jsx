import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  .asc-wrap { width: 100%; }

  .asc-section-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: var(--mcoe-muted);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 18px;
  }

  /* ── Cards ── */
  .asc-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .asc-card {
    background: var(--mcoe-card);
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: var(--transition);
    animation: ascFadeUp 0.3s ease both;
  }

  .asc-card:hover {
    border-color: rgba(245,200,66,0.2);
    box-shadow: var(--shadow-card);
  }

  @keyframes ascFadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .asc-card:nth-child(1) { animation-delay: 0.03s; }
  .asc-card:nth-child(2) { animation-delay: 0.07s; }
  .asc-card:nth-child(3) { animation-delay: 0.11s; }

  /* ── Card header ── */
  .asc-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 15px 8px;
  }

  .asc-user-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .asc-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--mcoe-gold-dim);
  }

  .asc-username {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: var(--mcoe-text);
    text-decoration: none;
    transition: var(--transition);
  }

  .asc-username:hover { color: var(--mcoe-gold); }

  .asc-menu-btn {
    background: none;
    border: none;
    color: var(--mcoe-muted);
    cursor: pointer;
    padding: 5px;
    border-radius: var(--radius-sm);
    display: grid;
    place-items: center;
    transition: var(--transition);
  }

  .asc-menu-btn:hover {
    background: var(--mcoe-navy-light);
    color: var(--mcoe-text);
  }

  /* ── Caption ── */
  .asc-caption {
    padding: 6px 15px 12px;
    font-size: 14px;
    color: var(--mcoe-text);
    line-height: 1.6;
    border-bottom: 1px solid var(--mcoe-border);
  }

  .asc-caption strong { color: var(--mcoe-gold); font-weight: 600; }

  /* ── Actions ── */
  .asc-actions {
    display: flex;
    gap: 6px;
    padding: 10px 12px 13px;
  }

  .asc-action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 13px;
    background: none;
    border: 1px solid var(--mcoe-border);
    border-radius: 20px;
    color: var(--mcoe-muted);
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: var(--transition);
  }

  .asc-action-btn:hover {
    background: var(--mcoe-navy-light);
    color: var(--mcoe-text);
    border-color: rgba(255,255,255,0.14);
  }

  .asc-action-btn.liked {
    color: var(--mcoe-danger);
    border-color: rgba(255,92,110,0.3);
    background: rgba(255,92,110,0.08);
  }

  /* ── States ── */
  .asc-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--mcoe-muted);
    font-size: 14px;
    font-style: italic;
  }

  /* ── Skeleton ── */
  .asc-skeleton {
    background: var(--mcoe-card);
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-lg);
    padding: 16px;
    animation: ascPulse 1.4s ease infinite;
  }

  @keyframes ascPulse {
    0%,100% { opacity: 0.45; }
    50%      { opacity: 0.8; }
  }

  .asc-skel-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .asc-skel-circle { width: 34px; height: 34px; border-radius: 50%; background: var(--mcoe-navy-light); flex-shrink: 0; }
  .asc-skel-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
  .asc-skel-line { height: 9px; border-radius: 6px; background: var(--mcoe-navy-light); }

  /* ── Comment modal ── */
  .asc-modal .modal-content {
    background: var(--mcoe-card);
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-lg);
    color: var(--mcoe-text);
  }

  .asc-modal .modal-header {
    border-bottom: 1px solid var(--mcoe-border);
    padding: 15px 18px;
  }

  .asc-modal .modal-header h5 {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 15px;
    color: var(--mcoe-text);
    margin: 0;
  }

  .asc-modal .btn-close { filter: invert(1) opacity(0.6); }

  .asc-modal .modal-body {
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .asc-modal-input {
    width: 100%;
    padding: 10px 13px;
    background: var(--mcoe-navy-light);
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-sm);
    color: var(--mcoe-text);
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    outline: none;
    transition: var(--transition);
  }

  .asc-modal-input::placeholder { color: var(--mcoe-muted); }
  .asc-modal-input:focus { border-color: var(--mcoe-gold); }

  .asc-comment-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 9px 11px;
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-sm);
    background: var(--mcoe-navy-mid);
  }

  .asc-comment-item strong { color: var(--mcoe-gold); font-size: 12.5px; }
  .asc-comment-text { font-size: 13px; color: var(--mcoe-text); margin-top: 2px; }

  .asc-comment-delete {
    padding: 3px 9px;
    background: rgba(255,92,110,0.12);
    border: 1px solid rgba(255,92,110,0.3);
    color: var(--mcoe-danger);
    border-radius: 6px;
    font-size: 11px;
    cursor: pointer;
    transition: var(--transition);
    flex-shrink: 0;
  }

  .asc-comment-delete:hover { background: rgba(255,92,110,0.22); }

  .asc-no-comments { font-size: 13px; color: var(--mcoe-muted); font-style: italic; }

  /* Bootstrap dropdown dark override (scoped) */
  .asc-wrap .dropdown-menu {
    background: var(--mcoe-card);
    border: 1px solid var(--mcoe-border);
  }

  .asc-wrap .dropdown-item {
    color: var(--mcoe-text);
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
  }

  .asc-wrap .dropdown-item:hover { background: var(--mcoe-navy-light); }
  .asc-wrap .dropdown-item.asc-delete { color: var(--mcoe-danger); }
  .asc-wrap .dropdown-item.asc-delete:hover { background: rgba(255,92,110,0.1); }
`;

function injectStyles(id, css) {
  if (document.getElementById(id)) return;
  const tag = document.createElement("style");
  tag.id = id;
  tag.textContent = css;
  document.head.appendChild(tag);
}

function SkeletonCard() {
  return (
    <div className="asc-skeleton">
      <div className="asc-skel-row">
        <div className="asc-skel-circle" />
        <div className="asc-skel-lines">
          <div className="asc-skel-line" style={{ width: "40%" }} />
          <div className="asc-skel-line" style={{ width: "60%" }} />
        </div>
      </div>
      <div className="asc-skel-line" style={{ width: "90%", marginBottom: 6 }} />
      <div className="asc-skel-line" style={{ width: "70%" }} />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

function Articles({ user }) {
  const { userId } = useParams();
  // ✅ Fixed: effectiveUserId is used as dep, not missing from dep array
  const effectiveUserId = userId || user?._id;

  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { injectStyles("mcoe-articles-sub-styles", STYLES); }, []);

  // ── Fetch articles for this profile ──
  useEffect(() => {
    if (!effectiveUserId) return;
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/moments/article");
        setArticles(
          res.data.filter((a) => a.user && a.user._id === effectiveUserId)
        );
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [effectiveUserId]); // ✅ Fixed: was [] — stale closure on effectiveUserId

  // ── Optimistic like toggle ──
  const toggleLike = async (articleId) => {
    setArticles((prev) =>
      prev.map((a) => {
        if (a._id !== articleId) return a;
        const liked = a.likes?.includes(user._id);
        return {
          ...a,
          likes: liked
            ? a.likes.filter((id) => id !== user._id)
            : [...(a.likes || []), user._id],
        };
      })
    );
    try {
      await api.put(`/api/moments/article/${articleId}/like`);
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  // ── Delete article ──
  const deleteArticle = async (articleId) => {
    try {
      await api.delete(`/api/moments/article/delete/${articleId}`);
      setArticles((prev) => prev.filter((a) => a._id !== articleId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // ── Add comment ──
  const addComment = async (e, articleId) => {
    if (e.key !== "Enter" || !e.target.value.trim()) return;
    try {
      const res = await api.post(
        `/api/moments/article/${articleId}/comment`,
        { text: e.target.value }
      );
      const updater = (prev) =>
        prev.map((a) =>
          a._id === articleId
            ? { ...a, comments: [res.data, ...(a.comments || [])] }
            : a
        );
      setArticles(updater);
      setSelectedArticle((prev) => ({
        ...prev,
        comments: [res.data, ...(prev.comments || [])],
      }));
      e.target.value = "";
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  // ── Delete comment ──
  const deleteComment = async (articleId, commentId) => {
    const updater = (prev) =>
      prev.map((a) =>
        a._id === articleId
          ? { ...a, comments: a.comments.filter((c) => c._id !== commentId) }
          : a
      );
    setArticles(updater);
    setSelectedArticle((prev) => ({
      ...prev,
      comments: prev.comments.filter((c) => c._id !== commentId),
    }));
    try {
      await api.delete(
        `/api/moments/article/delete/${articleId}/comment/${commentId}`
      );
    } catch (err) {
      console.error("Comment delete failed:", err);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="asc-wrap">
      <p className="asc-section-title">Articles</p>

      {loading ? (
        <div className="asc-list">
          {[0, 1].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : articles.length === 0 ? (
        <div className="asc-state">No articles yet.</div>
      ) : (
        <div className="asc-list">
          {articles.map((article) => {
            const isLiked = article.likes?.includes(user._id);
            return (
              <article key={article._id} className="asc-card">
                {/* Header */}
                <div className="asc-card-header">
                  <div className="asc-user-row">
                    <img
                      src={article.user.profilePic}
                      alt={article.user.name}
                      className="asc-avatar"
                    />
                    <span className="asc-username">{article.user.name}</span>
                  </div>

                  {article.user._id === user._id && (
                    <div className="dropdown">
                      <button className="asc-menu-btn" data-bs-toggle="dropdown">
                        <MoreHorizontal size={17} />
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li
                          className="dropdown-item asc-delete"
                          onClick={() => deleteArticle(article._id)}
                        >
                          Delete
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Caption */}
                <div className="asc-caption">
                  <strong>{article.user.name}:</strong> {article.caption}
                </div>

                {/* Actions */}
                <div className="asc-actions">
                  <button
                    className={`asc-action-btn${isLiked ? " liked" : ""}`}
                    onClick={() => toggleLike(article._id)}
                  >
                    <Heart size={15} fill={isLiked ? "currentColor" : "none"} />
                    {article.likes?.length || 0}
                  </button>

                  <button
                    className="asc-action-btn"
                    data-bs-toggle="modal"
                    data-bs-target="#ascCommentModal"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <MessageCircle size={15} />
                    {article.comments?.length || 0}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Comments Modal ── */}
      <div className="modal fade asc-modal" id="ascCommentModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Comments</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              {selectedArticle && (
                <>
                  <input
                    type="text"
                    className="asc-modal-input"
                    placeholder="Add a comment… (Enter to moment)"
                    onKeyDown={(e) => addComment(e, selectedArticle._id)}
                  />
                  {selectedArticle.comments?.length > 0 ? (
                    selectedArticle.comments.map((comment) => (
                      <div key={comment._id} className="asc-comment-item">
                        <div>
                          <strong>{comment.user.name}</strong>
                          <div className="asc-comment-text">{comment.text}</div>
                        </div>
                        {comment.user._id === user._id && (
                          <button
                            className="asc-comment-delete"
                            onClick={() =>
                              deleteComment(selectedArticle._id, comment._id)
                            }
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="asc-no-comments">No comments yet.</p>
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

export default Articles;