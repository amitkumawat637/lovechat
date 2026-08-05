import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";
import { API_URL } from "../config";

const EMOJIS = [
  "❤️", "😍", "😘", "🥰", "😊", "😂", "🔥", "💕",
  "😉", "🙈", "👋", "😭", "🥺", "💯", "✨", "🌹",
  "😎", "🤔", "👍", "🎉", "😅", "💋", "🌸", "☺️",
];

const MESSAGE_LIFETIME_MS = 10 * 60 * 1000;

const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatRelative = (isoString) => {
  if (!isoString) return "";
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin === 1) return "1 min ago";
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr === 1) return "1 hour ago";
  if (diffHr < 24) return `${diffHr} hours ago`;

  return "a while ago";
};

const Chat = ({ loggedInUser, chatUser, onlineUsers, socket, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [, forceTick] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isOnline = onlineUsers.includes(chatUser._id);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/messages/${loggedInUser.id}/${chatUser._id}`
        );
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatUser._id, loggedInUser.id]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("markSeen", { senderId: chatUser._id, receiverId: loggedInUser.id });
  }, [socket, chatUser._id, loggedInUser.id, messages.length]);

  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (message) => {
      if (
        message.sender === chatUser._id &&
        message.receiver === loggedInUser.id
      ) {
        setMessages((prev) => [...prev, message]);
        socket.emit("markSeen", { senderId: chatUser._id, receiverId: loggedInUser.id });
      }
    };

    const handleSeen = ({ by }) => {
      if (by === chatUser._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender === loggedInUser.id
              ? { ...m, seen: true, seenAt: new Date().toISOString() }
              : m
          )
        );
      }
    };

    socket.on("getMessage", handleIncoming);
    socket.on("messagesSeen", handleSeen);

    return () => {
      socket.off("getMessage", handleIncoming);
      socket.off("messagesSeen", handleSeen);
    };
  }, [socket, chatUser._id, loggedInUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((prev) =>
        prev.filter(
          (m) => Date.now() - new Date(m.createdAt).getTime() < MESSAGE_LIFETIME_MS
        )
      );
      forceTick((t) => t + 1);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);
    const handleVisibility = () => setIsBlurred(document.hidden);

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket) return;

    const messageData = {
      senderId: loggedInUser.id,
      receiverId: chatUser._id,
      text: text.trim(),
    };

    socket.emit("sendMessage", messageData);

    setMessages((prev) => [
      ...prev,
      {
        sender: loggedInUser.id,
        receiver: chatUser._id,
        text: text.trim(),
        createdAt: new Date().toISOString(),
        seen: false,
      },
    ]);

    setText("");
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const statusText = isOnline
    ? "Active now"
    : chatUser.lastSeen
    ? `Last seen ${formatRelative(chatUser.lastSeen)}`
    : "Offline";

  const lastSentIndex = [...messages]
    .map((m, i) => ({ ...m, i }))
    .reverse()
    .find((m) => m.sender === loggedInUser.id)?.i;

  return (
    <div className="chat-page" onContextMenu={(e) => e.preventDefault()}>
      <div className="chat-bg-heart bg-heart1">💕</div>
      <div className="chat-bg-heart bg-heart2">❤️</div>
      <div className="chat-bg-heart bg-heart3">💗</div>
      <div className="chat-bg-heart bg-heart4">💘</div>

      <div className="chat-header">
        <button className="chat-back-btn" onClick={onBack} aria-label="Back to profiles">
          ←
        </button>

        <div className="chat-header-avatar-wrap">
          {chatUser.photo ? (
            <img
              src={chatUser.photo}
              alt={chatUser.fullname}
              className="chat-header-photo"
            />
          ) : (
            <div className="chat-header-placeholder">
              {chatUser.fullname.charAt(0).toUpperCase()}
            </div>
          )}
          {isOnline && <span className="header-online-dot"></span>}
        </div>

        <div className="chat-header-info">
          <h4>{chatUser.fullname}</h4>
          <span className={`chat-status ${isOnline ? "online" : "offline"}`}>
            {statusText}
          </span>
        </div>

        <div className="chat-header-icon">💌</div>
      </div>

      <div className={`chat-body-wrap ${isBlurred ? "blurred" : ""}`}>
        <div className="chat-messages">
          {loading ? (
            <p className="chat-status-text">Loading messages...</p>
          ) : messages.length === 0 ? (
            <div className="chat-empty-state">
              <span className="chat-empty-emoji">💘</span>
              <p>Say hi to {chatUser.fullname}!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg._id || index}
                className={`chat-bubble-row ${
                  msg.sender === loggedInUser.id ? "sent-row" : "received-row"
                }`}
              >
                <div
                  className={`chat-bubble ${
                    msg.sender === loggedInUser.id ? "sent" : "received"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="chat-bubble-time">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
                {msg.sender === loggedInUser.id && index === lastSentIndex && (
                  <span className="seen-text">
                    {msg.seen ? `Seen ${formatRelative(msg.seenAt)}` : "Delivered"}
                  </span>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {isBlurred && <div className="screenshot-warning">🚫 Content hidden</div>}

      {showEmojiPicker && (
        <div className="emoji-picker">
          {EMOJIS.map((emoji) => (
            <button
              type="button"
              key={emoji}
              className="emoji-option"
              onClick={() => handleEmojiClick(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form className="chat-input-bar" onSubmit={handleSend}>
        <button
          type="button"
          className="emoji-toggle-btn"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          😊
        </button>

        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setShowEmojiPicker(false)}
        />

        <button type="submit" className="chat-send-btn">
          <span>Send</span> 💌
        </button>
      </form>
    </div>
  );
};

export default Chat;
