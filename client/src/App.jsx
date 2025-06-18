import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router";
import API from "./api/api.mjs";

import DefaultLayout from "./components/DefaultLayout";
import NotFound from "./components/shared/NotFound.jsx";

import HomePage from "./components/HomePage.jsx";
import GamePage from "./components/game-page/GamePage.jsx";
import LoginPage from "./components/login-page/LoginPage.jsx";
import ProfilePage from "./components/profile-page/ProfilePage.jsx";

import UserContext from "./contexts/userContext.js";

function App() {
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        setIsLoading(true);
        const userInfo = await API.getUserInfo();
        setUser(userInfo.user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const userResponse = await API.logIn(credentials);
      setUser(userResponse.user);
      setMessage({
        msg: `Welcome, ${userResponse.user.username}!`,
        type: "success",
      });
    } catch (err) {
      setMessage({ msg: err, type: "danger" });
    }
  };

  const handleLogout = async () => {
    try {
      await API.logOut();
      setUser(null);
      setMessage({ msg: "Logout successful!", type: "info" });
    } catch (err) {
      setMessage({ msg: err, type: "danger" });
    }
  };

  return (
    <UserContext.Provider
      value={{ user, isLoading, handleLogin, handleLogout }}
    >
      <Routes>
        <Route
          element={<DefaultLayout message={message} setMessage={setMessage} />}
        >          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate replace to="/" />
              ) : (
                <LoginPage handleLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/play"
            element={
              user ? (
                <GamePage />
              ) : (
                <Navigate replace to="/" />
              )
            }
          />
          <Route path="/demo" element={<GamePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
}

export default App;
