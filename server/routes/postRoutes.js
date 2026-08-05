const express = require("express");
const router = express.Router();
const { createPost, getUserPosts } = require("../controllers/postController");
const upload = require("../middleware/upload");

router.post("/", upload.single("image"), createPost);
router.get("/:userId", getUserPosts);

module.exports = router;
