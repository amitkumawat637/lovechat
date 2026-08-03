import React, { useState } from "react";
import "./Hero.css";
import { API_URL } from "../config";

const Hero = ({ loggedInUser, setLoggedInUser }) => {
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.message || "Login failed");
        return;
      }

      setLoggedInUser(data.user);
      localStorage.setItem("loveChatUser", JSON.stringify(data.user));
      setLoginData({ username: "", password: "" });
    } catch (err) {
      console.error(err);
      setLoginError("Server error, please try again later");
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem("loveChatUser");
  };

  return (
    <section className="hero-section">
      <div className="container">
        <div className="row align-items-center min-vh-100">

          {/* Left Side */}
          <div className="col-lg-6 text-center text-lg-start">

            <span className="badge bg-danger px-4 py-2 rounded-pill mb-4">
              ❤️ Find Your Perfect Match
            </span>

            <h1 className="hero-title">
              Meet New Friends <br />
              <span>Find True Love</span>
            </h1>

            <p className="hero-text mt-4">
              Love Chat is the safest place to meet amazing people,
              make new friends, chat instantly, and discover your
              soulmate from anywhere in the world.
            </p>

            {loggedInUser ? (
              <div className="mt-5">
                <p className="welcome-text">
                  Welcome back, <strong>{loggedInUser.fullname}</strong> 💕
                </p>
                <button className="btn hero-outline" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-5">
                <button className="btn hero-btn me-3">
                  Start Chatting
                </button>
                <button className="btn hero-outline">
                  Learn More
                </button>
              </div>
            )}

          </div>

          {/* Right Side */}
          <div className="col-lg-6 text-center">

            {loggedInUser ? (
              <div className="phone-card">

                <div className="floating floating1">❤️</div>
                <div className="floating floating2">💕</div>
                <div className="floating floating3">😍</div>

                {loggedInUser.photo ? (
                  <img
                    src={`${API_URL}${loggedInUser.photo}`}
                    alt={loggedInUser.fullname}
                    className="hero-img"
                  />
                ) : (
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
                    alt="girl"
                    className="hero-img"
                  />
                )}

              </div>
            ) : (
              <div className="login-card">
                <h3 className="login-title">💕 Login to Love Chat</h3>

                <form onSubmit={handleLogin}>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={loginData.username}
                    onChange={handleLoginChange}
                    required
                  />

                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                  />

                  {loginError && <p className="login-error">{loginError}</p>}

                  <button className="btn hero-btn login-submit-btn" type="submit">
                    Login
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;