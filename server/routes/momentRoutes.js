const express = require("express");
const router = express.Router();
const Moment = require("../models/Moment");
const Article = require("../models/Article");
const CommentArticle = require("../models/CommentArticle");
const Comment = require("../models/Comment");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { createMoment, getMoments, toggleLike, addComment ,createArticle,getArticle,toggleArticleLike,addArticleComment} =  require("../controllers/momentController");

router.get("/user/:userId", async (req, res) => {
  try {
    const moments = await Moment.find({ user: req.params.userId })
      .populate("user")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          model: "User",
        },
      })
      .sort({ createdAt: -1 });

    res.json(moments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", protect, getMoments);
router.post("/", protect, upload.single("image"), createMoment);
router.post("/:id/comment", protect, addComment);
router.put("/:id/like", protect, toggleLike);
router.delete("/delete/:momentId", protect,async (req, res) => {
      try {
    // Find the moment
    var moment = await Moment.findById(req.params.momentId)
    if(!moment) return res.status(404).json("Not found")
    if(moment.user.toString()!==req.user.id) {
        return res.status(401).send("Not Allowed")
    }
    const status = await moment.deleteOne()
    res.json(status);
    } catch (error) {
      res.status(400).json({ error: "Some error occured" });
    }
});
router.delete("/delete/:momentId/comment/:commentid", protect,async (req, res) => {
  try {
    var comment = await Comment.findById(req.params.commentid)
    var moment = await Moment.findById(req.params.momentId)
    if(!comment) return res.status(404).json("Not found")
        if(comment.user.toString()!==req.user.id) {
        return res.status(401).send("Not Allowed")
      }
    const status = await comment.deleteOne()
    res.json(req.status);
    } catch (error) {
      res.status(400).json({ error: "Some error occured1" });
    }
});


router.delete("/article/delete/:articleId", protect,async (req, res) => {
      try {
    // Find the moment
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