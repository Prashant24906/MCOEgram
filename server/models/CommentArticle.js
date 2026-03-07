const mongoose = require("mongoose");

const commentarticleSchema = new mongoose.Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "article",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  text: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("CommenArticle", commentarticleSchema);