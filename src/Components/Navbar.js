import React, { useState } from "react";
import RegisterModal from "./RegisterModal";
import "./Navbar.css";

const Navbar = ({ activeView, setActiveView }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark custom-navbar shadow-sm fixed-top">
        <div className="container">
          <a
            className="navbar-brand fw-bold fs-3"
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              setActiveView("home");
            }}
          >
            💕 Love Chat
          </a>

          <button
            className="navbar-toggler border-0 shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarMenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarMenu">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <a
                  className={`nav-link ${activeView === "home" ? "active" : ""}`}
                  href="#home"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveView("home");
                  }}
                >
                  Home
                </a>
              </li>

              <li className="nav-item">
                <a
                  className={`nav-link ${activeView === "profiles" ? "active" : ""}`}
                  href="#profiles"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveView("profiles");
                  }}
                >
                  Profiles
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#features">
                  Features
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#gallery">
                  Gallery
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#contact">
                  Contact
                </a>
              </li>
            </ul>

            <button
              className="btn btn-love rounded-pill px-4"
              onClick={() => setShowModal(true)}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <RegisterModal show={showModal} handleClose={() => setShowModal(false)} />
    </>
  );
};

export default Navbar;
