import React, { useState } from "react";
import RegisterModal from "./RegisterModal";
import "./Navbar.css";

const Navbar = ({
  activeView,
  setActiveView,
  loggedInUser,
  friendRequests = [],
  onAcceptRequest,
  onLogout,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showBellMenu, setShowBellMenu] = useState(false);

  const incomingPending = loggedInUser
    ? friendRequests.filter(
        (r) => r.status === "pending" && r.to._id === loggedInUser.id
      )
    : [];

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

            {loggedInUser && (
              <div className="nav-bell-wrap">
                <button
                  className="nav-bell-btn"
                  onClick={() => setShowBellMenu((prev) => !prev)}
                >
                  🔔
                  {incomingPending.length > 0 && (
                    <span className="nav-bell-badge">
                      {incomingPending.length}
                    </span>
                  )}
                </button>

                {showBellMenu && (
                  <div className="nav-bell-dropdown">
                    {incomingPending.length === 0 ? (
                      <p className="nav-bell-empty">No new requests</p>
                    ) : (
                      incomingPending.map((r) => (
                        <div className="nav-bell-item" key={r._id}>
                          <span>
                            <strong>{r.from.fullname}</strong> wants to connect
                          </span>
                          <button
                            className="nav-bell-accept"
                            onClick={() => {
                              onAcceptRequest(r._id);
                              setShowBellMenu(false);
                            }}
                          >
                            Accept
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {loggedInUser ? (
              <button
                className="btn nav-logout-btn rounded-pill px-4"
                onClick={onLogout}
              >
                Logout
              </button>
            ) : (
              <button
                className="btn btn-love rounded-pill px-4"
                onClick={() => setShowModal(true)}
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </nav>

      <RegisterModal show={showModal} handleClose={() => setShowModal(false)} />
    </>
  );
};

export default Navbar;
