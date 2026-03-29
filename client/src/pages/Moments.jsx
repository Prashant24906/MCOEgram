import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  .psc-wrap { width: 100%; }

  .psc-section-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: var(--mcoe-muted);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 18px;
  }

  /* ── Grid of cards ── */
  .psc-grid {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  /* ── Moment card ── */
  .psc-card {
    background: var(--mcoe-card);
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: var(--transition);
    animation: pscFadeUp 0.3s ease both;
  }

  .psc-card:hover {
    border-color: rgba(245,200,66,0.2);
    box-shadow: var(--shadow-card);
  }

  @keyframes pscFadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .psc-card:nth-child(1) { animation-delay: 0.03s; }
  .psc-card:nth-child(2) { animation-delay: 0.07s; }
  .psc-card:nth-child(3) { animation-delay: 0.11s; }
  .psc-card:nth-child(4) { animation-delay: 0.15s; }

  /* ── Card header ── */
  .psc-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 15px 9px;
  }

  .psc-user-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .psc-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--mcoe-gold-dim);
  }

  .psc-username {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: var(--mcoe-text);
    text-decoration: none;
    transition: var(--transition);
  }

  .psc-username:hover { color: var(--mcoe-gold); }

  .psc-menu-btn {
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

  .psc-menu-btn:hover {
    background: var(--mcoe-navy-light);
    color: var(--mcoe-text);
  }

  /* ── Moment image ── */
  .psc-image {
    width: 100%;
    display: block;
    max-height: 460px;
    object-fit: cover;
    background: var(--mcoe-navy-light);
  }

  /* ── Caption ── */
  .psc-caption {
    padding: 10px 15px;
    font-size: 13.5px;
    color: var(--mcoe-text);
    line-height: 1.5;
    border-top: 1px solid var(--mcoe-border);
  }

  .psc-caption strong { color: var(--mcoe-gold); font-weight: 600; }

  /* ── Actions ── */
  .psc-actions {
    display: flex;
    gap: 6px;
    padding: 10px 12px 13px;
  }

  .psc-action-btn {
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

  .psc-action-btn:hover {
    background: var(--mcoe-navy-light);
    color: var(--mcoe-text);
    border-color: rgba(255,255,255,0.14);
  }

  .psc-action-btn.liked {
    color: var(--mcoe-danger);
    border-color: rgba(255,92,110,0.3);
    background: rgba(255,92,110,0.08);
  }

  /* ── States ── */
  .psc-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--mcoe-muted);
    font-size: 14px;
    font-style: italic;
  }

  /* ── Skeleton ── */
  .psc-skeleton {
    background: var(--mcoe-card);
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    animation: pscPulse 1.4s ease infinite;
  }

  @keyframes pscPulse {
    0%,100% { opacity: 0.45; }
    50%      { opacity: 0.8; }
  }

  .psc-skel-img  { width: 100%; height: 220px; background: var(--mcoe-navy-light); }
  .psc-skel-body { padding: 12px 15px; display: flex; flex-direction: column; gap: 7px; }
  .psc-skel-line { height: 9px; border-radius: 6px; background: var(--mcoe-navy-light); }

  /* ── Comment modal theming ── */
  .psc-modal .modal-content {
    background: var(--mcoe-card);
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-lg);
    color: var(--mcoe-text);
  }

  .psc-modal .modal-header {
    border-bottom: 1px solid var(--mcoe-border);
    padding: 15px 18px;
  }

  .psc-modal .modal-header h5 {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 15px;
    color: var(--mcoe-text);
    margin: 0;
  }

  .psc-modal .btn-close { filter: invert(1) opacity(0.6); }

  .psc-modal .modal-body {
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .psc-modal-input {
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

  .psc-modal-input::placeholder { color: var(--mcoe-muted); }
  .psc-modal-input:focus { border-color: var(--mcoe-gold); }

  .psc-comment-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 9px 11px;
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-sm);
    background: var(--mcoe-navy-mid);
  }

  .psc-comment-item strong { color: var(--mcoe-gold); font-size: 12.5px; }
  .psc-comment-item .psc-comment-text { font-size: 13px; color: var(--mcoe-text); margin-top: 2px; }

  .psc-comment-delete {
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

  .psc-comment-delete:hover { background: rgba(255,92,110,0.22); }

  .psc-no-comments { font-size: 13px; color: var(--mcoe-muted); font-style: italic; }

  /* Bootstrap dropdown dark override (scoped) */
  .psc-wrap .dropdown-menu {
    background: var(--mcoe-card);
    border: 1px solid var(--mcoe-border);
  }

  .psc-wrap .dropdown-item {
    color: var(--mcoe-text);
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
  }

  .psc-wrap .dropdown-item:hover { background: var(--mcoe-navy-light); }

  .psc-wrap .dropdown-item.psc-delete { color: var(--mcoe-danger); }
  .psc-wrap .dropdown-item.psc-delete:hover { background: rgba(255,92,110,0.1); }
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
    <div className="psc-skeleton">
      <div className="psc-skel-img" />
      <div className="psc-skel-body">
        <div className="psc-skel-line" style={{ width: "38%" }} />
        <div className="psc-skel-line" style={{ width: "70%" }} />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

function Moments({ currentUser }) {
  const { userId } = useParams();
  const effectiveUserId = userId || currentUser?._id;

  const [moments, setMoments] = useState([]);
  const [selectedMoment, setSelectedMoment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { injectStyles("mcoe-moments-sub-styles", STYLES); }, []);

  // ── Fetch moments for this profile ──
  useEffect(() => {
    if (!effectiveUserId) return;
    const fetchMoments = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/moments");
        setMoments(
          res.data.filter((p) => p.user && p.user._id === effectiveUserId)
        );
      } catch (err) {
        console.error("Failed to fetch moments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMoments();
  }, [effectiveUserId]);

  // ── Optimistic like toggle ──
  const toggleLike = async (momentId) => {
    setMoments((prev) =>
      prev.map((p) => {
        if (p._id !== momentId) return p;
        const liked = p.likes.includes(currentUser._id);
        return {
          ...p,
          likes: liked
            ? p.likes.filter((id) => id !== currentUser._id)
            : [...p.likes, currentUser._id],
        };
      })
    );
    try {
      await api.put(`/api/moments/${momentId}/like`);
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  // ── Delete moment ──
  const deleteMoment = async (momentId) => {
    try {
      await api.delete(`/api/moments/delete/${momentId}`);
      setMoments((prev) => prev.filter((p) => p._id !== momentId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // ── Add comment ──
  const addComment = async (e, momentId) => {
    if (e.key !== "Enter" || !e.target.value.trim()) return;
    try {
      const res = await api.post(`/api/moments/${momentId}/comment`, {
        text: e.target.value,
      });
      const updater = (prev) =>
        prev.map((p) =>
          p._id === momentId
            ? { ...p, comments: [res.data, ...(p.comments || [])] }
            : p
        );
      setMoments(updater);
      setSelectedMoment((prev) => ({
        ...prev,
        comments: [res.data, ...(prev.comments || [])],
      }));
      e.target.value = "";
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  // ── Delete comment ──
  const deleteComment = async (momentId, commentId) => {
    const updater = (prev) =>
      prev.map((p) =>
        p._id === momentId
          ? { ...p, comments: p.comments.filter((c) => c._id !== commentId) }
          : p
      );
    setMoments(updater);
    setSelectedMoment((prev) => ({
      ...prev,
      comments: prev.comments.filter((c) => c._id !== commentId),
    }));
    try {
      await api.delete(`/api/moments/delete/${momentId}/comment/${commentId}`);
    } catch (err) {
      console.error("Comment delete failed:", err);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="psc-wrap">
      <p className="psc-section-title">Moments</p>

      {loading ? (
        <div className="psc-grid">
          {[0, 1].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : moments.length === 0 ? (
        <div className="psc-state">No moments yet.</div>
      ) : (
        <div className="psc-grid">
          {moments.map((moment) => {
            const isLiked = moment.likes.includes(currentUser._id);
            return (
              <article key={moment._id} className="psc-card">
                {/* Header */}
                <div className="psc-card-header">
                  <div className="psc-user-row">
                    <img
                      src={moment.user.profilePic}
                      alt={moment.user.name}
                      className="psc-avatar"
                    />
                    <span className="psc-username">{moment.user.name}</span>
                  </div>

                  {moment.user._id === currentUser._id && (
                    <div className="dropdown">
                      <button className="psc-menu-btn" data-bs-toggle="dropdown">
                        <MoreHorizontal size={17} />
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li
                          className="dropdown-item psc-delete"
                          onClick={() => deleteMoment(moment._id)}
                        >
                          Delete
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Image */}
                <img src={moment.imageUrl} alt={moment.caption} className="psc-image" />

                {/* Caption */}
                {moment.caption && (
                  <div className="psc-caption">
                    <strong>{moment.user.name}</strong> {moment.caption}
                  </div>
                )}

                {/* Actions */}
                <div className="psc-actions">
                  <button
                    className={`psc-action-btn${isLiked ? " liked" : ""}`}
                    onClick={() => toggleLike(moment._id)}
                  >
                    <Heart size={15} fill={isLiked ? "currentColor" : "none"} />
                    {moment.likes.length}
                  </button>

                  <button
                    className="psc-action-btn"
                    data-bs-toggle="modal"
                    data-bs-target="#pscCommentModal"
                    onClick={() => setSelectedMoment(moment)}
                  >
                    <MessageCircle size={15} />
                    {moment.comments?.length || 0}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Comments Modal ── */}
      <div className="modal fade psc-modal" id="pscCommentModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Comments</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              {selectedMoment && (
                <>
                  <input
                    type="text"
                    className="psc-modal-input"
                    placeholder="Add a comment… (Enter to moment)"
                    onKeyDown={(e) => addComment(e, selectedMoment._id)}
                  />
                  {selectedMoment.comments?.length > 0 ? (
                    selectedMoment.comments.map((comment) => (
                      <div key={comment._id} className="psc-comment-item">
                        <div>
                          <strong>{comment.user.name}</strong>
                          <div className="psc-comment-text">{comment.text}</div>
                        </div>
                        {comment.user._id === currentUser._id && (
                          <button
                            className="psc-comment-delete"
                            onClick={() =>
                              deleteComment(selectedMoment._id, comment._id)
                            }
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="psc-no-comments">No comments yet.</p>
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

export default Moments;