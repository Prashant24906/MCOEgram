const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

router.get("/me", protect, async (req, res) => {
  res.json(req.user);
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