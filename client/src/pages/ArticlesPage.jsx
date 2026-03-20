import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, MoreHorizontal, BookOpen, Plus, X } from "lucide-react";
import Navbar from "../components/Navbar";

// ─── Shared design tokens (same as ChatsPage / PostsPage) ─────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  /* CSS variables are declared on :root in ChatsPage already;
     repeat here so this page works standalone too */
  :root {
    --mcoe-navy:       #0f1b35;
    --mcoe-navy-mid:   #162040;
    --mcoe-navy-light: #1e2d54;
    --mcoe-card:       #192348;
    --mcoe-border:     rgba(255,255,255,0.07);
    --mcoe-gold:       #f5c842;
    --mcoe-gold-dim:   rgba(245,200,66,0.15);
    --mcoe-gold-glow:  rgba(245,200,66,0.35);
    --mcoe-teal:       #38d9c0;
    --mcoe-teal-dim:   rgba(56,217,192,0.12);
    --mcoe-text:       #e8eaf2;
    --mcoe-muted:      #7a86a8;
    --mcoe-danger:     #ff5c6e;
    --mcoe-online:     #3ddc84;
    --radius-sm:       8px;
    --radius-md:       14px;
    --radius-lg:       20px;
    --shadow-card:     0 4px 24px rgba(0,0,0,0.35);
    --shadow-glow:     0 0 20px rgba(245,200,66,0.18);
    --transition:      all 0.22s cubic-bezier(0.4,0,0.2,1);
  }

  /* ── Page root — scoped, never touches Bootstrap/Navbar ── */
  .ap-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--mcoe-navy);
    color: var(--mcoe-text);
    min-height: calc(100vh - 56px);
    padding: 32px 16px 60px;
  }

  .ap-root * { box-sizing: border-box; }

  /* ── Page header ── */
  .ap-hero {
    text-align: center;
    margin-bottom: 32px;
  }

  .ap-hero-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--mcoe-gold);
    margin-bottom: 8px;
  }

  .ap-hero-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(28px, 5vw, 44px);
    font-weight: 800;
    letter-spacing: -1px;
    color: var(--mcoe-text);
    line-height: 1.1;
  }

  .ap-hero-sub {
    font-size: 14px;
    color: var(--mcoe-muted);
    margin-top: 8px;
  }

  /* ── Add article button ── */
  .ap-add-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 0 auto 32px;
    padding: 11px 22px;
    background: var(--mcoe-gold);
    color: var(--mcoe-navy);
    border: none;
    border-radius: var(--radius-sm);
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.3px;
    cursor: pointer;
    transition: var(--transition);
  }

  .ap-add-btn:hover {
    background: #ffd84d;
    box-shadow: var(--shadow-glow);
    transform: translateY(-2px);
  }

  /* ── Feed layout ── */
  .ap-feed {
    max-width: 620px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* ── Article card ── */
  .ap-card {
    background: var(--mcoe-card);
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: var(--transition);
    animation: apFadeUp 0.35s ease both;
  }

  .ap-card:hover {
    border-color: rgba(245,200,66,0.2);
    box-shadow: var(--shadow-card);
    transform: translateY(-2px);
  }

  @keyframes apFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* staggered entry */
  .ap-card:nth-child(1) { animation-delay: 0.04s; }
  .ap-card:nth-child(2) { animation-delay: 0.08s; }
  .ap-card:nth-child(3) { animation-delay: 0.12s; }
  .ap-card:nth-child(4) { animation-delay: 0.16s; }
  .ap-card:nth-child(5) { animation-delay: 0.20s; }

  /* ── Card header ── */
  .ap-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px 10px;
  }

  .ap-user-row {
    display: flex;
    align-items: center;
    gap: 11px;
  }

  .ap-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--mcoe-gold-dim);
  }

  .ap-username {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: var(--mcoe-text);
    text-decoration: none;
    transition: var(--transition);
  }

  .ap-username:hover { color: var(--mcoe-gold); }

  .ap-date {
    font-size: 11px;
    color: var(--mcoe-muted);
    margin-top: 2px;
  }

  /* ── Three-dot menu ── */
  .ap-menu-btn {
    background: none;
    border: none;
    color: var(--mcoe-muted);
    cursor: pointer;
    padding: 6px;
    border-radius: var(--radius-sm);
    transition: var(--transition);
    display: grid;
    place-items: center;
  }

  .ap-menu-btn:hover {
    background: var(--mcoe-navy-light);
    color: var(--mcoe-text);
  }

  /* ── Caption body ── */
  .ap-caption {
    padding: 4px 18px 14px;
    font-size: 14.5px;
    line-height: 1.6;
    color: var(--mcoe-text);
    border-bottom: 1px solid var(--mcoe-border);
  }

  .ap-caption strong {
    color: var(--mcoe-gold);
    font-weight: 600;
  }

  /* ── Actions row ── */
  .ap-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 12px 14px;
  }

  .ap-action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    background: none;
    border: 1px solid var(--mcoe-border);
    border-radius: 20px;
    color: var(--mcoe-muted);
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: var(--transition);
  }

  .ap-action-btn:hover {
    background: var(--mcoe-navy-light);
    color: var(--mcoe-text);
    border-color: rgba(255,255,255,0.14);
  }

  .ap-action-btn.liked {
    color: var(--mcoe-danger);
    border-color: rgba(255,92,110,0.3);
    background: rgba(255,92,110,0.08);
  }

  .ap-action-btn.liked:hover {
    background: rgba(255,92,110,0.14);
  }

  /* ── Empty / loading states ── */
  .ap-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--mcoe-muted);
  }

  .ap-state-icon {
    font-size: 40px;
    margin-bottom: 14px;
    opacity: 0.4;
  }

  .ap-state p { font-size: 15px; }

  /* ── Skeleton ── */
  .ap-skeleton {
    background: var(--mcoe-card);
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-lg);
    padding: 18px;
    animation: apPulse 1.4s ease infinite;
  }

  @keyframes apPulse {
    0%, 100% { opacity: 0.45; }
    50%       { opacity: 0.8; }
  }

  .ap-skel-row {
    display: flex; align-items: center; gap: 12px; margin-bottom: 14px;
  }

  .ap-skel-circle {
    width: 38px; height: 38px; border-radius: 50%;
    background: var(--mcoe-navy-light); flex-shrink: 0;
  }

  .ap-skel-lines { flex: 1; display: flex; flex-direction: column; gap: 7px; }

  .ap-skel-line {
    height: 10px; border-radius: 6px; background: var(--mcoe-navy-light);
  }

  /* ── Modal overrides (keep Bootstrap modal but retheme internals) ── */
  .ap-modal .modal-content {
    background: var(--mcoe-card);
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-lg);
    color: var(--mcoe-text);
  }

  .ap-modal .modal-header {
    border-bottom: 1px solid var(--mcoe-border);
    padding: 16px 20px;
  }

  .ap-modal .modal-header h5 {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 16px;
    color: var(--mcoe-text);
    margin: 0;
  }

  .ap-modal .btn-close { filter: invert(1) opacity(0.6); }

  .ap-modal .modal-body { padding: 20px; }
  .ap-modal .modal-footer { border-top: 1px solid var(--mcoe-border); padding: 14px 20px; }

  .ap-modal-input {
    width: 100%;
    padding: 11px 14px;
    background: var(--mcoe-navy-light);
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-sm);
    color: var(--mcoe-text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: var(--transition);
  }

  .ap-modal-input::placeholder { color: var(--mcoe-muted); }
  .ap-modal-input:focus { border-color: var(--mcoe-gold); }

  .ap-modal-post-btn {
    padding: 9px 22px;
    background: var(--mcoe-gold);
    color: var(--mcoe-navy);
    border: none;
    border-radius: var(--radius-sm);
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    transition: var(--transition);
  }

  .ap-modal-post-btn:hover { background: #ffd84d; box-shadow: var(--shadow-glow); }

  /* ── Comment item ── */
  .ap-comment-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 10px 12px;
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-sm);
    margin-bottom: 8px;
    background: var(--mcoe-navy-mid);
  }

  .ap-comment-item strong { color: var(--mcoe-gold); font-size: 13px; }
  .ap-comment-item div { font-size: 13.5px; color: var(--mcoe-text); margin-top: 2px; }

  .ap-comment-delete {
    padding: 4px 10px;
    background: rgba(255,92,110,0.12);
    border: 1px solid rgba(255,92,110,0.3);
    color: var(--mcoe-danger);
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition: var(--transition);
    flex-shrink: 0;
  }

  .ap-comment-delete:hover { background: rgba(255,92,110,0.22); }

  .ap-no-comments { font-size: 13px; color: var(--mcoe-muted); font-style: italic; }

  /* Bootstrap dropdown dark override */
  .ap-root .dropdown-menu {
    background: var(--mcoe-card);
    border: 1px solid var(--mcoe-border);
  }

  .ap-root .dropdown-item {
    color: var(--mcoe-text);
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
  }

  .ap-root .dropdown-item:hover { background: var(--mcoe-navy-light); }
  .ap-root .dropdown-item.ap-delete { color: var(--mcoe-danger); }
  .ap-root .dropdown-item.ap-delete:hover { background: rgba(255,92,110,0.1); }
`;

function injectStyles(id, css) {
  if (document.getElementById(id)) return;
  const tag = document.createElement("style");
  tag.id = id;
  tag.textContent = css;
  document.head.appendChild(tag);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function SkeletonCard() {
  return (
    <div className="ap-skeleton">
      <div className="ap-skel-row">
        <div className="ap-skel-circle" />
        <div className="ap-skel-lines">
          <div className="ap-skel-line" style={{ width: "40%" }} />
          <div className="ap-skel-line" style={{ width: "25%" }} />
        </div>
      </div>
      <div className="ap-skel-line" style={{ width: "95%", marginBottom: 8 }} />
      <div className="ap-skel-line" style={{ width: "80%" }} />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

function ArticlesPage({ user }) {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { injectStyles("mcoe-articles-styles", STYLES); }, []);

  // ── Fetch articles ──
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await api.get("/api/posts/article");
        setArticles(res.data);
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // ── Post new article ──
  const postArticle = async () => {
    if (!caption.trim()) return;
    try {
      const res = await api.post("/api/posts/article", { caption });
      setArticles((prev) => [res.data, ...prev]);
      setCaption("");
    } catch (err) {
      console.error("Failed to post article:", err);
    }
  };

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
      await api.put(`/api/posts/article/${articleId}/like`);
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  // ── Delete article ──
  const deleteArticle = async (articleId) => {
    try {
      await api.delete(`/api/posts/article/delete/${articleId}`);
      setArticles((prev) => prev.filter((a) => a._id !== articleId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // ── Add comment ──
  const addComment = async (e, articleId) => {
    if (e.key !== "Enter" || !e.target.value.trim()) return;
    try {
      const res = await api.post(`/api/posts/article/${articleId}/comment`, {
        text: e.target.value,
      });
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
        `/api/posts/article/delete/${articleId}/comment/${commentId}`
      );
    } catch (err) {
      console.error("Comment delete failed:", err);
    }
  };

  return (
    <>

      <div className="ap-root nb-page-offset">
        {/* ── Hero header ── */}
        <div className="ap-hero">
          <p className="ap-hero-eyebrow">MCOEgram</p>
          <h1 className="ap-hero-title">Articles</h1>
          <p className="ap-hero-sub">Thoughts, ideas & discussions from your college</p>
        </div>

        {/* ── Add article trigger ── */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            className="ap-add-btn"
            data-bs-toggle="modal"
            data-bs-target="#apAddModal"
          >
            <Plus size={15} /> Add Article
          </button>
        </div>

        {/* ── Feed ── */}
        <div className="ap-feed">
          {loading ? (
            [0, 1, 2].map((i) => <SkeletonCard key={i} />)
          ) : articles.length === 0 ? (
            <div className="ap-state">
              <div className="ap-state-icon"><BookOpen size={40} /></div>
              <p>No articles yet — be the first to share!</p>
            </div>
          ) : (
            articles.map((article) => {
              const isLiked = article.likes?.includes(user._id);
              return (
                <article key={article._id} className="ap-card">
                  {/* Header */}
                  <div className="ap-card-header">
                    <div className="ap-user-row">
                      <img
                        src={article.user.profilePic}
                        alt={article.user.name}
                        className="ap-avatar"
                      />
                      <div>
                        <Link to={`/profile/${article.user._id}`} className="ap-username">
                          {article.user.name}
                        </Link>
                        <div className="ap-date">{formatDate(article.createdAt)}</div>
                      </div>
                    </div>

                    {article.user._id === user._id && (
                      <div className="dropdown">
                        <button className="ap-menu-btn" data-bs-toggle="dropdown">
                          <MoreHorizontal size={18} />
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li
                            className="dropdown-item ap-delete"
                            onClick={() => deleteArticle(article._id)}
                          >
                            Delete
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Caption */}
                  <div className="ap-caption">
                    <strong>{article.user.name}:</strong> {article.caption}
                  </div>

                  {/* Actions */}
                  <div className="ap-actions">
                    <button
                      className={`ap-action-btn${isLiked ? " liked" : ""}`}
                      onClick={() => toggleLike(article._id)}
                    >
                      <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                      {article.likes?.length || 0}
                    </button>

                    <button
                      className="ap-action-btn"
                      data-bs-toggle="modal"
                      data-bs-target="#apCommentModal"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <MessageCircle size={16} />
                      {article.comments?.length || 0}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* ── Add Article Modal ── */}
      <div className="modal fade ap-modal" id="apAddModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Add Article</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="ap-modal-input"
                placeholder="What's on your mind?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && postArticle()}
              />
            </div>
            <div className="modal-footer">
              <button
                className="ap-modal-post-btn"
                onClick={postArticle}
                data-bs-dismiss="modal"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Comments Modal ── */}
      <div className="modal fade ap-modal" id="apCommentModal">
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
                    className="ap-modal-input"
                    placeholder="Add a comment… (Enter to post)"
                    style={{ marginBottom: 14 }}
                    onKeyDown={(e) => addComment(e, selectedArticle._id)}
                  />
                  {selectedArticle.comments?.length > 0 ? (
                    selectedArticle.comments.map((comment) => (
                      <div key={comment._id} className="ap-comment-item">
                        <div>
                          <strong>{comment.user.name}</strong>
                          <div>{comment.text}</div>
                        </div>
                        {comment.user._id === user._id && (
                          <button
                            className="ap-comment-delete"
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
                    <p className="ap-no-comments">No comments yet.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ArticlesPage;