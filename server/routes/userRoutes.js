const express = require("express");
const router = express.Router();
const {
  registerUser,
  getUsers,
  getUserById,
  updateUser,
  loginUser,
} = require("../controllers/userController");
const upload = require("../middleware/upload");

router.post("/register", upload.single("photo"), registerUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", upload.single("photo"), updateUser);
router.post("/login", loginUser);

module.exports = router;
