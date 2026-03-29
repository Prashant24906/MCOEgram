const cloudinary = require("../config/cloudinary");
const Moment = require("../models/Moment");
const Article = require("../models/Article");
const Comment = require("../models/Comment");
const CommentArticle = require("../models/CommentArticle");

exports.getMoments = async (req, res) => {
  try {
    const moments = await Moment.find()
      .populate("user", "name profilePic")
      .sort({ createdAt: -1 });

    const momentsWithComments = await Promise.all(
      moments.map(async (moment) => {
        const comments = await Comment.find({ moment: moment._id })
          .populate("user", "name profilePic")
          .sort({ createdAt: -1 });

        return {
          ...moment.toObject(),
          comments,
        };
      }),
    );

    res.json(momentsWithComments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch moments" });
  }
};

exports.getArticle = async (req, res) => {
  try {
    const articles = await Article.find()
      .populate("user", "name profilePic")
      .sort({ createdAt: -1 });
    const WithComments = await Promise.all(
      articles.map(async (article) => {
        const comments = await CommentArticle.find({ article: article._id })
          .populate("user", "name profilePic")
          .sort({ createdAt: -1 });

        return {
          ...article.toObject(),
          comments,
        };
      }),
    );
    res.json(WithComments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch moments" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const comment = await Comment.create({
      moment: req.params.id,
      user: req.user._id,
      text,
    });

    const populatedComment = await comment.populate("user", "name profilePic");

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: "Comment failed" });
  }
};
exports.addArticleComment = async (req, res) => {
  try {
    const { text } = req.body;

    const comment = await CommentArticle.create({
      article: req.params.id,
      user: req.user._id,
      text,
    });

    const populatedComment = await comment.populate("user", "name profilePic");

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ message: "Comment failed" });
  }
};

exports.toggleArticleLike = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Artice not found" });
    }

    const userId = req.user._id.toString();

    const alreadyLiked = article.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      article.likes = article.likes.filter((id) => id.toString() !== userId);
    } else {
      article.likes.push(userId);
    }

    await article.save();

    res.json({
      likesCount: article.likes.length,
      liked: !alreadyLiked,
    });
  } catch (error) {
    res.status(500).json({ message: "Like failed" });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const moment = await Moment.findById(req.params.id);

    if (!moment) {
      return res.status(404).json({ message: "Moment not found" });
    }

    const userId = req.user._id.toString();

    const alreadyLiked = moment.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      moment.likes = moment.likes.filter((id) => id.toString() !== userId);
    } else {
      moment.likes.push(userId);
    }

    await moment.save();

    res.json({
      likesCount: moment.likes.length,
      liked: !alreadyLiked,
    });
  } catch (error) {
    res.status(500).json({ message: "Like failed" });
  }
};

exports.createMoment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const { caption } = req.body;

    const uploadToCloudinary = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "mcoegram" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );

        stream.end(req.file.buffer);
      });

    const result = await uploadToCloudinary();

    const moment = await Moment.create({
      user: req.user._id,
      imageUrl: result.secure_url,
      caption,
    });

    res.status(201).json(moment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Moment creation failed" });
  }
};
exports.createArticle = async (req, res) => {
  try {
    const { caption } = req.body || {};
    const article = await Article.create({
      user: req.user._id,
      caption,
    });
    res.status(201).json(article);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Article creation failed" });
  }
};
