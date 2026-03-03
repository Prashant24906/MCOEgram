const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { createPost, getPosts, toggleLike, addComment } =  require("../controllers/postController");

router.get("/", protect, getPosts);
router.post("/", protect, upload.single("image"), createPost);
router.post("/:id/comment", protect, addComment);
router.put("/:id/like", protect, toggleLike);

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

module.exports = router;