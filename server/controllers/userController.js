const bcrypt = require("bcryptjs");
const User = require("../models/User");

const registerUser = async (req, res) => {
  try {
    const { username, fullname, dob, mobile, password } = req.body;

    let hobbies = [];
    if (req.body.hobbies) {
      hobbies = JSON.parse(req.body.hobbies);
    }

    if (!username || !fullname || !dob || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { mobile }],
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or mobile number already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const photoPath = req.file ? `/uploads/${req.file.filename}` : "";

    const newUser = new User({
      username,
      fullname,
      dob,
      mobile,
      password: hashedPassword,
      hobbies,
      photo: photoPath,
    });

    await newUser.save();

    res.status(201).json({
      message: "Profile created successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        fullname: newUser.fullname,
        photo: newUser.photo,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};




const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        photo: user.photo,
        hobbies: user.hobbies,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerUser, getUsers, loginUser };