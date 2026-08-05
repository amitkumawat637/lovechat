const Post = require("../models/Post");

const createPost = async (req, res) => {
  try {
    const { userId, song, caption } = req.body;

    if (!userId || !req.file) {
      return res.status(400).json({ message: "userId and an image are required" });
    }

    const post = await Post.create({
      user: userId,
      image: req.file.path,
      song: song || "",
      caption: caption || "",
    });

    res.status(201).json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createPost, getUserPosts };
