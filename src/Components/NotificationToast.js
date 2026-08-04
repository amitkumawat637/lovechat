import React from "react";
import "./NotificationToast.css";

const NotificationToast = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div className="notification-toast">
      <span className="toast-icon">
        {toast.type === "accepted" ? "✅" : "💌"}
      </span>
      <div className="toast-text">
        <strong>{toast.name}</strong> {toast.message}
      </div>
      <button className="toast-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default NotificationToast;
