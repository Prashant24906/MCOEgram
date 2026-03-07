const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Article = require("../models/Article");
const CommentArticle = require("../models/CommentArticle");
const Comment = require("../models/Comment");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { createPost, getPosts, toggleLike, addComment ,createArticle,getArticle,toggleArticleLike,addArticleComment} =  require("../controllers/postController");

router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate("user")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          model: "User",
        },
      })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", protect, getPosts);
router.post("/", protect, upload.single("image"), createPost);
router.post("/:id/comment", protect, addComment);
router.put("/:id/like", protect, toggleLike);
router.delete("/delete/:postId", protect,async (req, res) => {
  console.log(req.params.postId)
      try {
    // Find the post
    var post = await Post.findById(req.params.postId)
    if(!post) return res.status(404).json("Not found")
    if(post.user.toString()!==req.user.id) {
        return res.status(401).send("Not Allowed")
    }
    const status = await post.deleteOne()
    res.json(status);
    } catch (error) {
      res.status(400).json({ error: "Some error occured" });
    }
});
router.delete("/delete/:postId/comment/:commentid", protect,async (req, res) => {
  try {
    console.log(req.params)
    var comment = await Comment.findById(req.params.commentid)
    var post = await Post.findById(req.params.postId)
    if(!comment) return res.status(404).json("Not found")
        if(comment.user.toString()!==req.user.id) {
        return res.status(401).send("Not Allowed")
      }
      console.log(req.params)
    const status = await comment.deleteOne()
    res.json(req.status);
    } catch (error) {
      res.status(400).json({ error: "Some error occured1" });
    }
});


router.delete("/article/delete/:articleId", protect,async (req, res) => {
  console.log(req.params.articleId)
      try {
    // Find the post
    var article = await Article.findById(req.params.articleId)
    if(!article) return res.status(404).json("Not found")
    if(article.user.toString()!==req.user.id) {
        return res.status(401).send("Not Allowed")
    }
    const status = await article.deleteOne()
    res.json(status);
    } catch (error) {
      res.status(400).json({ error: "Some error occured" });
    }
});
router.delete("/article/delete/:articleId/comment/:commentid", protect,async (req, res) => {
  console.log(req.params.articleId)
      try {
    var comment = await CommentArticle.findById(req.params.commentid)
    var article = await Article.findById(req.params.articleId)
    if(!comment) return res.status(404).json("Not found")
    if(comment.user.toString()!==req.user.id) {
        return res.status(401).send("Not Allowed")
    }
    const status = await comment.deleteOne()
    res.json(status);
    } catch (error) {
      res.status(400).json({ error: "Some error occured" });
    }
});
router.get("/article", protect, getArticle);
router.post("/article", protect, createArticle);
router.post("/article/:id/comment", protect, addArticleComment);
router.put("/article/:id/like", protect, toggleArticleLike);


module.exports = router;