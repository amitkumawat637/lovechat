const express = require("express");
const router = express.Router();
const { registerUser, getUsers,loginUser  } = require("../controllers/userController");
const upload = require("../middleware/upload");

router.post("/register", upload.single("photo"), registerUser);
router.get("/", getUsers);
router.post("/login", loginUser);

module.exports = router;