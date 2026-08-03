import React, { useState } from "react";
import "./RegisterModal.css";
import { API_URL } from "../config";

const hobbiesList = [
  "Cricket",
  "Football",
  "Dance",
  "Singing",
  "DJ",
  "Gaming",
  "Gym",
  "Reading",
  "Coding",
  "Photography",
  "Traveling",
  "Cooking",
  "Swimming",
  "Movies"
];

const RegisterModal = ({ show, handleClose }) => {
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    dob: "",
    mobile: "",
    password: "",
    hobbies: [],
  });

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleHobby = (e) => {
    const value = e.target.value;

    if (e.target.checked) {
      setFormData({
        ...formData,
        hobbies: [...formData.hobbies, value],
      });
    } else {
      setFormData({
        ...formData,
        hobbies: formData.hobbies.filter((h) => h !== value),
      });
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("username", formData.username);
      data.append("fullname", formData.fullname);
      data.append("dob", formData.dob);
      data.append("mobile", formData.mobile);
      data.append("password", formData.password);
      data.append("hobbies", JSON.stringify(formData.hobbies));

      if (photo) {
        data.append("photo", photo);
      }

      const res = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Something went wrong");
        return;
      }

      alert("Profile Created Successfully ❤️");
      handleClose();
      setFormData({
        username: "",
        fullname: "",
        dob: "",
        mobile: "",
        password: "",
        hobbies: [],
      });
      setPhoto(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
      alert("Server error, please try again later");
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="love-modal">
        <button className="close-btn" onClick={handleClose}>
          ×
        </button>

        <h2>💕 Create Your Love Profile</h2>

        <form onSubmit={handleSubmit}>
          <div className="photo-upload">
            {preview && (
              <img src={preview} alt="Preview" className="photo-preview" />
            )}
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </div>

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="fullname"
            placeholder="Full Name"
            value={formData.fullname}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label className="title">Select Hobbies</label>

          <div className="hobbies">
            {hobbiesList.map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  value={item}
                  checked={formData.hobbies.includes(item)}
                  onChange={handleHobby}
                />
                {item}
              </label>
            ))}
          </div>

          <button className="register-btn" type="submit">
            Create Profile ❤️
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;