const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

const cloudinary = require("../config/cloudinary");
const upload = require("../middlewares/uploadMiddleware");

router.put("/update-pic", protect, upload.single("profilePic"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // Upload buffer to Cloudinary (same pattern as createMoment)
    const uploadToCloudinary = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "mcoegram/profile_pics" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

    const result = await uploadToCloudinary();

    const user = await require("../models/User").findByIdAndUpdate(
      req.user._id,
      { profilePic: result.secure_url },
      { new: true }
    ).select("-__v");

    res.json(user);
  } catch (err) {
    console.error("Profile pic update error:", err);
    res.status(500).json({ message: "Failed to update profile picture" });
  }
});

router.put("/update", protect, async (req, res) => {
  const { bio,name ,department,year} = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    user.bio = bio || user.bio;
    user.name = name || user.name;
    user.department = department || user.department;
    user.year = year || user.year;
    await user.save();
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.user._id } },   // exclude logged in user
      "name email profilePic"           // select only needed fields
    );

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
});
module.exports = router;