const express = require("express");
const router = express.Router();
const { sendRequest, acceptRequest, getMyRequests } = require("../controllers/friendController");

router.post("/send", sendRequest);
router.post("/accept", acceptRequest);
router.get("/:userId", getMyRequests);

module.exports = router;
