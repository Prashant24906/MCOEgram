const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profilePic: String,
  bio: {
    type: String,
    default: "",
  },
  department: {
    type: String,
    default: "",
  },
  year: {
    type: String,
    enum: ["1st","2nd","3rd","4th"],
    default: "",
  },
}, { timestamps: true });
module.exports = mongoose.models.User || mongoose.model("User", userSchema);