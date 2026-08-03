const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    hobbies: {
      type: [String],
      default: [],
    },
      photo: {
      type: String, // stores file path/URL
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);