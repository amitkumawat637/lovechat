import { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";
import './App.css';
import Navbar from './Components/Navbar';
import Hero from "./Components/Hero";
import Profiles from "./Components/Profiles";
import Chat from "./Components/Chat";
import { API_URL } from "./config";

function App() {
  const [activeView, setActiveView] = useState("home");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("loveChatUser");
    if (savedUser) {
      setLoggedInUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      socketRef.current = io(API_URL);
      socketRef.current.emit("addUser", loggedInUser.id);

      socketRef.current.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [loggedInUser]);

  const openChat = (user) => {
    setChatUser(user);
    setActiveView("chat");
  };

  return (
    <>
      <Navbar activeView={activeView} setActiveView={setActiveView} />

      {activeView === "home" && (
        <>
          <Hero loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />
          {loggedInUser && (
            <Profiles
              loggedInUser={loggedInUser}
              onlineUsers={onlineUsers}
              onStartMessage={openChat}
            />
          )}
        </>
      )}

      {activeView === "profiles" && (
        <Profiles
          loggedInUser={loggedInUser}
          onlineUsers={onlineUsers}
          onStartMessage={openChat}
        />
      )}

      {activeView === "chat" && chatUser && loggedInUser && (
        <Chat
          loggedInUser={loggedInUser}
          chatUser={chatUser}
          onlineUsers={onlineUsers}
          socket={socketRef.current}
        />
      )}
    </>
  );
}

export default App;