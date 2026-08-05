import { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";
import './App.css';
import Navbar from './Components/Navbar';
import Hero from "./Components/Hero";
import Profiles from "./Components/Profiles";
import Chat from "./Components/Chat";
import NotificationToast from "./Components/NotificationToast";
import { API_URL } from "./config";

function App() {
  const [activeView, setActiveView] = useState("home");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [toast, setToast] = useState(null);
  const [heroExpired, setHeroExpired] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("loveChatUser");
    if (savedUser) {
      setLoggedInUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      const timer = setTimeout(() => setHeroExpired(true), 10000);
      return () => clearTimeout(timer);
    } else {
      setHeroExpired(false);
    }
  }, [loggedInUser]);

  useEffect(() => {
    if (!loggedInUser) return;

    const fetchRequests = async () => {
      try {
        const res = await fetch(`${API_URL}/api/requests/${loggedInUser.id}`);
        const data = await res.json();
        if (res.ok) setFriendRequests(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRequests();
  }, [loggedInUser]);

  useEffect(() => {
    if (loggedInUser) {
      socketRef.current = io(API_URL);
      socketRef.current.emit("addUser", loggedInUser.id);

      socketRef.current.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      socketRef.current.on("newFriendRequest", (request) => {
        setFriendRequests((prev) => [...prev, request]);
        setToast({
          type: "request",
          name: request.from.fullname,
          message: "sent you a follow request",
        });
      });

      socketRef.current.on("requestAccepted", (request) => {
        setFriendRequests((prev) =>
          prev.map((r) => (r._id === request._id ? request : r))
        );
        setToast({
          type: "accepted",
          name: request.to.fullname,
          message: "accepted your follow request",
        });
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [loggedInUser]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const openChat = (user) => {
    setChatUser(user);
    setActiveView("chat");
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem("loveChatUser");
    setActiveView("home");
    setChatUser(null);
  };

  const sendFriendRequest = async (toUser) => {
    try {
      const res = await fetch(`${API_URL}/api/requests/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromId: loggedInUser.id, toId: toUser._id }),
      });
      const data = await res.json();
      if (res.ok) {
        setFriendRequests((prev) => [...prev, data]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      const res = await fetch(`${API_URL}/api/requests/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      if (res.ok) {
        setFriendRequests((prev) =>
          prev.map((r) => (r._id === data._id ? data : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        loggedInUser={loggedInUser}
        friendRequests={friendRequests}
        onAcceptRequest={acceptFriendRequest}
        onLogout={handleLogout}
      />

      {toast && (
        <NotificationToast toast={toast} onClose={() => setToast(null)} />
      )}

      {activeView === "home" && (
        <>
          {!heroExpired && (
            <Hero loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />
          )}
          {loggedInUser && (
            <Profiles
              loggedInUser={loggedInUser}
              onlineUsers={onlineUsers}
              friendRequests={friendRequests}
              onStartMessage={openChat}
              onSendRequest={sendFriendRequest}
              onAcceptRequest={acceptFriendRequest}
            />
          )}
        </>
      )}

      {activeView === "profiles" && (
        <Profiles
          loggedInUser={loggedInUser}
          onlineUsers={onlineUsers}
          friendRequests={friendRequests}
          onStartMessage={openChat}
          onSendRequest={sendFriendRequest}
          onAcceptRequest={acceptFriendRequest}
        />
      )}

      {activeView === "chat" && chatUser && loggedInUser && (
        <Chat
          loggedInUser={loggedInUser}
          chatUser={chatUser}
          onlineUsers={onlineUsers}
          socket={socketRef.current}
          onBack={() => setActiveView("profiles")}
        />
      )}
    </>
  );
}

export default App;
