const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, picture, email_verified } = payload;

    //  Ensure email is verified
    if (!email_verified) {
      return res.status(400).json({ message: "Email not verified" });
    }

    // Restrict to college domain
    if (!email.endsWith("@moderncoe.edu.in")) {
      return res.status(403).json({
        message: "Only MCOE students can login Please Login using MCOE gmail",
      });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        profilePic: picture,
      });
    }

    // Generate our own JWT
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token: jwtToken,
      user,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Authentication failed" });
  }
};