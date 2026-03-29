const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  moment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Moment",
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

module.exports = mongoose.model("Comment", commentSchema);