import React, { useEffect, useState } from "react";
import "./Profiles.css";
import { API_URL } from "../config";

const Profiles = ({
  loggedInUser,
  onlineUsers,
  friendRequests,
  onStartMessage,
  onSendRequest,
  onAcceptRequest,
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users`);
        const data = await res.json();

        if (!res.ok) {
          setError("Failed to load profiles");
          return;
        }

        setUsers(data);
      } catch (err) {
        console.error(err);
        setError("Server error, please try again later");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getRequestStatus = (otherUserId) => {
    if (!loggedInUser) return { status: "none" };

    const request = friendRequests.find(
      (r) =>
        (r.from._id === loggedInUser.id && r.to._id === otherUserId) ||
        (r.from._id === otherUserId && r.to._id === loggedInUser.id)
    );

    if (!request) return { status: "none" };

    if (request.status === "accepted") {
      return { status: "accepted", request };
    }

    if (request.from._id === loggedInUser.id) {
      return { status: "pending_sent", request };
    }

    return { status: "pending_received", request };
  };

  if (loading) {
    return (
      <section className="profiles-section">
        <div className="profiles-container">
          <p className="profiles-status">Loading profiles...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="profiles-section">
        <div className="profiles-container">
          <p className="profiles-status">{error}</p>
        </div>
      </section>
    );
  }

  if (users.length === 0) {
    return (
      <section className="profiles-section">
        <div className="profiles-container">
          <p className="profiles-status">No profiles yet. Be the first to join 💕</p>
        </div>
      </section>
    );
  }

  return (
    <section className="profiles-section">
      <div className="profiles-bg-heart p-heart1">💕</div>
      <div className="profiles-bg-heart p-heart2">❤️</div>
      <div className="profiles-bg-heart p-heart3">💗</div>
      <div className="profiles-bg-heart p-heart4">💘</div>
      <div className="profiles-bg-heart p-heart5">💖</div>
      <div className="profiles-bg-heart p-heart6">💞</div>

      <div className="profiles-container">
        <h2 className="profiles-heading">💕 Explore Profiles</h2>

        <div className="profiles-grid">
          {users.map((user) => {
            const isOwnProfile = loggedInUser && loggedInUser.id === user._id;
            const isOnline = onlineUsers.includes(user._id);
            const { status, request } = getRequestStatus(user._id);

            return (
              <div className="profile-card" key={user._id}>
                <div className="profile-photo-wrapper">
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt={user.fullname}
                      className="profile-photo"
                    />
                  ) : (
                    <div className="profile-photo placeholder">
                      {user.fullname.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isOnline && <span className="online-dot"></span>}
                </div>

                <div className="profile-info">
                  <h4>{user.fullname}</h4>
                  <p className="profile-username">@{user.username}</p>

                  {user.hobbies && user.hobbies.length > 0 && (
                    <div className="profile-hobbies">
                      {user.hobbies.map((hobby) => (
                        <span className="hobby-tag" key={hobby}>
                          {hobby}
                        </span>
                      ))}
                    </div>
                  )}

                  {isOwnProfile ? (
                    <button className="start-message-btn own-profile-btn" disabled>
                      This is you
                    </button>
                  ) : status === "none" ? (
                    <button
                      className="start-message-btn"
                      onClick={() => onSendRequest(user)}
                    >
                      🔔 Follow Request
                    </button>
                  ) : status === "pending_sent" ? (
                    <button className="start-message-btn requested-btn" disabled>
                      ⏳ Requested
                    </button>
                  ) : status === "pending_received" ? (
                    <button
                      className="start-message-btn accept-btn"
                      onClick={() => onAcceptRequest(request._id)}
                    >
                      ✅ Accept Request
                    </button>
                  ) : (
                    <button
                      className="start-message-btn"
                      onClick={() => onStartMessage(user)}
                    >
                      💬 Start Messaging
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Profiles;
