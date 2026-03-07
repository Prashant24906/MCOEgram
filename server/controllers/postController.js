const cloudinary = require("../config/cloudinary");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name profilePic")
      .sort({ createdAt: -1 });

    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const comments = await Comment.find({ post: post._id })
          .populate("user", "name profilePic")
          .sort({ createdAt: -1 });

        return {
          ...post.toObject(),
          comments,
        };
      })
    );

    res.json(postsWithComments);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const comment = await Comment.create({
      post: req.params.id,
      user: req.user._id,
      text,
    });

    const populatedComment = await comment.populate(
      "user",
      "name profilePic"
    );

    res.status(201).json(populatedComment);

  } catch (error) {
    res.status(500).json({ message: "Comment failed" });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user._id.toString();

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      likesCount: post.likes.length,
      liked: !alreadyLiked
    });

  } catch (error) {
    res.status(500).json({ message: "Like failed" });
  }
};


exports.createPost = async (req, res) => {
  try {
    const { caption } = req.body;

    const result = await cloudinary.uploader.upload_stream(
      { folder: "mcoegram" },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ message: "Upload failed" });
        }

        const post = await Post.create({
          user: req.user._id,
          imageUrl: result.secure_url,
          caption,
        });

        res.status(201).json(post);
      }
    );

    result.end(req.file.buffer);

  } catch (error) {
    res.status(500).json({ message: "Post creation failed" });
  }
};