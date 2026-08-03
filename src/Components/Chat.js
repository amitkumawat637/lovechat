import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";
import { API_URL } from "../config";

const EMOJIS = [
  "❤️", "😍", "😘", "🥰", "😊", "😂", "🔥", "💕",
  "😉", "🙈", "👋", "😭", "🥺", "💯", "✨", "🌹",
  "😎", "🤔", "👍", "🎉", "😅", "💋", "🌸", "☺️",
];

const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const Chat = ({ loggedInUser, chatUser, onlineUsers, socket }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

    const handleIncoming = (message) => {
      if (
        message.sender === chatUser._id &&
        message.receiver === loggedInUser.id
      ) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("getMessage", handleIncoming);

    return () => {
      socket.off("getMessage", handleIncoming);
    };
  }, [socket, chatUser._id, loggedInUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      },
    ]);

    setText("");
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="chat-page">
      <div className="chat-bg-heart bg-heart1">💕</div>
      <div className="chat-bg-heart bg-heart2">❤️</div>
      <div className="chat-bg-heart bg-heart3">💗</div>
      <div className="chat-bg-heart bg-heart4">💘</div>

      <div className="chat-header">
        <div className="chat-header-avatar-wrap">
          {chatUser.photo ? (
            <img
              src={`${API_URL}${chatUser.photo}`}
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
            {isOnline ? "Active now" : "Offline"}
          </span>
        </div>

        <div className="chat-header-icon">💌</div>
      </div>

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
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

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