const FriendRequest = require("../models/FriendRequest");

const sendRequest = async (req, res) => {
  try {
    const { fromId, toId } = req.body;

    if (!fromId || !toId) {
      return res.status(400).json({ message: "fromId and toId are required" });
    }

    if (fromId === toId) {
      return res.status(400).json({ message: "You can't send a request to yourself" });
    }

    const existing = await FriendRequest.findOne({
      $or: [
        { from: fromId, to: toId },
        { from: toId, to: fromId },
      ],
    });

    if (existing) {
      return res.status(409).json({ message: "A request already exists between these users" });
    }

    const request = await FriendRequest.create({ from: fromId, to: toId });
    const populated = await request.populate("from to", "fullname username photo");

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const receiverSocketId = onlineUsers[toId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newFriendRequest", populated);
    }

    res.status(201).json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await FriendRequest.findByIdAndUpdate(
      requestId,
      { status: "accepted" },
      { new: true }
    ).populate("from to", "fullname username photo");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const senderSocketId = onlineUsers[request.from._id.toString()];

    if (senderSocketId) {
      io.to(senderSocketId).emit("requestAccepted", request);
    }

    res.status(200).json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    const requests = await FriendRequest.find({
      $or: [{ from: userId }, { to: userId }],
    }).populate("from to", "fullname username photo");

    res.status(200).json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { sendRequest, acceptRequest, getMyRequests };
