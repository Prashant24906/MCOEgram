import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, MoreHorizontal, ImagePlus } from "lucide-react";
import Navbar from "../components/Navbar";
import heic2any from "heic2any";

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

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
    --radius-sm:       8px;
    --radius-md:       14px;
    --radius-lg:       20px;
    --shadow-card:     0 4px 24px rgba(0,0,0,0.35);
    --shadow-glow:     0 0 20px rgba(245,200,66,0.18);
    --transition:      all 0.22s cubic-bezier(0.4,0,0.2,1);
  }

  .pp-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--mcoe-navy);
    color: var(--mcoe-text);
    min-height: calc(100vh - 56px);
    padding: 32px 16px 60px;
  }

  .pp-root * { box-sizing: border-box; }

  /* ── Hero ── */
  .pp-hero {
    text-align: center;
    margin-bottom: 32px;
  }

  .pp-hero-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--mcoe-gold);
    margin-bottom: 8px;
  }

  .pp-hero-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(28px, 5vw, 44px);
    font-weight: 800;
    letter-spacing: -1px;
    color: var(--mcoe-text);
    line-height: 1.1;
  }

  .pp-hero-sub {
    font-size: 14px;
    color: var(--mcoe-muted);
    margin-top: 8px;
  }

  /* ── Add post button ── */
  .pp-add-btn {
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

  .pp-add-btn:hover {
    background: #ffd84d;
    box-shadow: var(--shadow-glow);
    transform: translateY(-2px);
  }

  /* ── Feed ── */
  .pp-feed {
    max-width: 540px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* ── Post card ── */
  .pp-card {
    background: var(--mcoe-card);
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: var(--transition);
    animation: ppFadeUp 0.35s ease both;
  }

  .pp-card:hover {
    border-color: rgba(245,200,66,0.2);
    box-shadow: var(--shadow-card);
  }

  @keyframes ppFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .pp-card:nth-child(1) { animation-delay: 0.04s; }
  .pp-card:nth-child(2) { animation-delay: 0.08s; }
  .pp-card:nth-child(3) { animation-delay: 0.12s; }
  .pp-card:nth-child(4) { animation-delay: 0.16s; }

  /* ── Card header ── */
  .pp-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 10px;
  }

  .pp-user-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .pp-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--mcoe-gold-dim);
  }

  .pp-username {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: var(--mcoe-text);
    text-decoration: none;
    transition: var(--transition);
  }

  .pp-username:hover { color: var(--mcoe-gold); }

  .pp-menu-btn {
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

  .pp-menu-btn:hover {
    background: var(--mcoe-navy-light);
    color: var(--mcoe-text);
  }

  /* ── Post image ── */
  .pp-image {
    width: 100%;
    display: block;
    max-height: 520px;
    object-fit: cover;
    background: var(--mcoe-navy-light);
  }

  /* ── Caption ── */
  .pp-caption {
    padding: 12px 16px;
    font-size: 14px;
    color: var(--mcoe-text);
    line-height: 1.55;
    border-top: 1px solid var(--mcoe-border);
  }

  .pp-caption strong { color: var(--mcoe-gold); font-weight: 600; }

  /* ── Actions ── */
  .pp-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 12px 14px;
  }

  .pp-action-btn {
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

  .pp-action-btn:hover {
    background: var(--mcoe-navy-light);
    color: var(--mcoe-text);
    border-color: rgba(255,255,255,0.14);
  }

  .pp-action-btn.liked {
    color: var(--mcoe-danger);
    border-color: rgba(255,92,110,0.3);
    background: rgba(255,92,110,0.08);
  }

  .pp-action-btn.liked:hover { background: rgba(255,92,110,0.14); }

  /* ── States ── */
  .pp-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--mcoe-muted);
  }

  .pp-state p { font-size: 15px; }

  /* ── Skeleton ── */
  .pp-skeleton {
    background: var(--mcoe-card);
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    animation: ppPulse 1.4s ease infinite;
  }

  @keyframes ppPulse {
    0%,100% { opacity: 0.45; }
    50%      { opacity: 0.8; }
  }

  .pp-skel-img {
    width: 100%; height: 260px; background: var(--mcoe-navy-light);
  }

  .pp-skel-body { padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }

  .pp-skel-line {
    height: 10px; border-radius: 6px; background: var(--mcoe-navy-light);
  }

  /* ── Modal theming ── */
  .pp-modal .modal-content {
    background: var(--mcoe-card);
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-lg);
    color: var(--mcoe-text);
  }

  .pp-modal .modal-header {
    border-bottom: 1px solid var(--mcoe-border);
    padding: 16px 20px;
  }

  .pp-modal .modal-header h5 {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 16px;
    color: var(--mcoe-text);
    margin: 0;
  }

  .pp-modal .btn-close { filter: invert(1) opacity(0.6); }
  .pp-modal .modal-body { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
  .pp-modal .modal-footer { border-top: 1px solid var(--mcoe-border); padding: 14px 20px; }

  .pp-modal-input {
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

  .pp-modal-input::placeholder { color: var(--mcoe-muted); }
  .pp-modal-input:focus { border-color: var(--mcoe-gold); }

  /* file input */
  .pp-file-label {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 11px 14px;
    background: var(--mcoe-navy-light);
    border: 1px dashed rgba(245,200,66,0.35);
    border-radius: var(--radius-sm);
    color: var(--mcoe-muted);
    font-size: 13px;
    cursor: pointer;
    transition: var(--transition);
  }

  .pp-file-label:hover {
    border-color: var(--mcoe-gold);
    color: var(--mcoe-text);
  }

  .pp-file-label input { display: none; }

  .pp-file-name {
    font-size: 12px;
    color: var(--mcoe-teal);
    margin-top: -4px;
  }

  .pp-modal-post-btn {
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

  .pp-modal-post-btn:hover { background: #ffd84d; box-shadow: var(--shadow-glow); }
  .pp-modal-post-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── Comment item ── */
  .pp-comment-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 10px 12px;
    border: 1px solid var(--mcoe-border);
    border-radius: var(--radius-sm);
    margin-bottom: 8px;
    background: var(--mcoe-navy-mid);
  }

  .pp-comment-item strong { color: var(--mcoe-gold); font-size: 13px; }
  .pp-comment-item div   { font-size: 13.5px; color: var(--mcoe-text); margin-top: 2px; }

  .pp-comment-delete {
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

  .pp-comment-delete:hover { background: rgba(255,92,110,0.22); }

  .pp-no-comments { font-size: 13px; color: var(--mcoe-muted); font-style: italic; }

  /* Bootstrap dropdown dark override */
  .pp-root .dropdown-menu {
    background: var(--mcoe-card);
    border: 1px solid var(--mcoe-border);
  }

  .pp-root .dropdown-item {
    color: var(--mcoe-text);
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
  }

  .pp-root .dropdown-item:hover { background: var(--mcoe-navy-light); }
  .pp-root .dropdown-item.pp-delete { color: var(--mcoe-danger); }
  .pp-root .dropdown-item.pp-delete:hover { background: rgba(255,92,110,0.1); }
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
    <div className="pp-skeleton">
      <div className="pp-skel-img" />
      <div className="pp-skel-body">
        <div className="pp-skel-line" style={{ width: "40%" }} />
        <div className="pp-skel-line" style={{ width: "75%" }} />
        <div className="pp-skel-line" style={{ width: "55%" }} />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

function PostsPage({ user }) {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => { injectStyles("mcoe-posts-styles", STYLES); }, []);

  // ── Fetch posts ──
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("/api/posts");
        setPosts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // ── Handle image selection + HEIC conversion ──
  const handleImageChange = async (e) => {
    let file = e.target.files[0];
    if (!file) return;
    try {
      if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
        const blob = await heic2any({ blob: file, toType: "image/jpeg" });
        file = new File([blob], "converted.jpeg", { type: "image/jpeg" });
      }
      setImage(file);
    } catch (err) {
      console.error("HEIC conversion failed:", err);
    }
  };

  // ── Submit post ──
  const handleSubmit = async () => {
    if (!image) return;
    setPosting(true);
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("caption", caption);
      const res = await api.post("/api/posts", formData);
      setPosts((prev) => [res.data, ...prev]);
      setCaption("");
      setImage(null);
    } catch (err) {
      console.error("Post failed:", err);
    } finally {
      setPosting(false);
    }
  };

  // ── Optimistic like toggle ──
  const toggleLike = async (postId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id !== postId) return p;
        const liked = p.likes.includes(user._id);
        return {
          ...p,
          likes: liked
            ? p.likes.filter((id) => id !== user._id)
            : [...p.likes, user._id],
        };
      })
    );
    try {
      await api.put(`/api/posts/${postId}/like`);
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  // ── Delete post ──
  const deletePost = async (postId) => {
    try {
      await api.delete(`/api/posts/delete/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // ── Add comment ──
  const addComment = async (e, postId) => {
    if (e.key !== "Enter" || !e.target.value.trim()) return;
    try {
      const res = await api.post(`/api/posts/${postId}/comment`, {
        text: e.target.value,
      });
      const updater = (prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: [res.data, ...(p.comments || [])] }
            : p
        );
      setPosts(updater);
      setSelectedPost((prev) => ({
        ...prev,
        comments: [res.data, ...(prev.comments || [])],
      }));
      e.target.value = "";
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  // ── Delete comment ──
  const deleteComment = async (postId, commentId) => {
    const updater = (prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, comments: p.comments.filter((c) => c._id !== commentId) }
          : p
      );
    setPosts(updater);
    setSelectedPost((prev) => ({
      ...prev,
      comments: prev.comments.filter((c) => c._id !== commentId),
    }));
    try {
      await api.delete(`/api/posts/delete/${postId}/comment/${commentId}`);
    } catch (err) {
      console.error("Comment delete failed:", err);
    }
  };

  return (
    <>

      <div className="pp-root nb-page-offset">
        {/* ── Hero ── */}
        <div className="pp-hero">
          <p className="pp-hero-eyebrow">MCOEgram</p>
          <h1 className="pp-hero-title">Posts</h1>
          <p className="pp-hero-sub">Photos & moments from your college</p>
        </div>

        {/* ── Add post button ── */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            className="pp-add-btn"
            data-bs-toggle="modal"
            data-bs-target="#ppAddModal"
          >
            <ImagePlus size={15} /> Add Post
          </button>
        </div>

        {/* ── Feed ── */}
        <div className="pp-feed">
          {loading ? (
            [0, 1, 2].map((i) => <SkeletonCard key={i} />)
          ) : posts.length === 0 ? (
            <div className="pp-state">
              <p>No posts yet — share your first photo!</p>
            </div>
          ) : (
            posts.map((post) => {
              const isLiked = post.likes?.includes(user._id);
              return (
                <article key={post._id} className="pp-card">
                  {/* Header */}
                  <div className="pp-card-header">
                    <div className="pp-user-row">
                      <img
                        src={post.user.profilePic}
                        alt={post.user.name}
                        className="pp-avatar"
                      />
                      <Link to={`/profile/${post.user._id}`} className="pp-username">
                        {post.user.name}
                      </Link>
                    </div>

                    {post.user._id === user._id && (
                      <div className="dropdown">
                        <button className="pp-menu-btn" data-bs-toggle="dropdown">
                          <MoreHorizontal size={18} />
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li
                            className="dropdown-item pp-delete"
                            onClick={() => deletePost(post._id)}
                          >
                            Delete
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Image */}
                  <img src={post.imageUrl} alt={post.caption} className="pp-image" />

                  {/* Caption */}
                  {post.caption && (
                    <div className="pp-caption">
                      <strong>{post.user.name}</strong> {post.caption}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pp-actions">
                    <button
                      className={`pp-action-btn${isLiked ? " liked" : ""}`}
                      onClick={() => toggleLike(post._id)}
                    >
                      <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                      {post.likes.length}
                    </button>

                    <button
                      className="pp-action-btn"
                      data-bs-toggle="modal"
                      data-bs-target="#ppCommentModal"
                      onClick={() => setSelectedPost(post)}
                    >
                      <MessageCircle size={16} />
                      {post.comments?.length || 0}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* ── Add Post Modal ── */}
      <div className="modal fade pp-modal" id="ppAddModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Add Post</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              <label className="pp-file-label">
                <ImagePlus size={16} />
                {image ? "Change photo" : "Choose a photo"}
                <input
                  type="file"
                  accept="image/*,.heic"
                  onChange={handleImageChange}
                />
              </label>
              {image && <p className="pp-file-name">📎 {image.name}</p>}
              <input
                type="text"
                className="pp-modal-input"
                placeholder="Add a caption…"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button
                className="pp-modal-post-btn"
                onClick={handleSubmit}
                data-bs-dismiss="modal"
                disabled={!image || posting}
              >
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Comments Modal ── */}
      <div className="modal fade pp-modal" id="ppCommentModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Comments</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              {selectedPost && (
                <>
                  <input
                    type="text"
                    className="pp-modal-input"
                    placeholder="Add a comment… (Enter to post)"
                    onKeyDown={(e) => addComment(e, selectedPost._id)}
                  />
                  {selectedPost.comments?.length > 0 ? (
                    selectedPost.comments.map((comment) => (
                      <div key={comment._id} className="pp-comment-item">
                        <div>
                          <strong>{comment.user.name}</strong>
                          <div>{comment.text}</div>
                        </div>
                        {comment.user._id === user._id && (
                          <button
                            className="pp-comment-delete"
                            onClick={() =>
                              deleteComment(selectedPost._id, comment._id)
                            }
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="pp-no-comments">No comments yet.</p>
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

export default PostsPage;