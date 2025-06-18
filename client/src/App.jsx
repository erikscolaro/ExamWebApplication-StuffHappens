import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router";
import API from "./api/api.mjs";

import DefaultLayout from "./components/DefaultLayout";
import NotFound from "./components/shared/NotFound.jsx";

import HomePage from "./components/HomePage.jsx";
import GamePage from "./components/game-page/GamePage.jsx";
import { LoginForm } from "./components/shared/AuthComponents.jsx";
import ProfilePage from "./components/profile-page/ProfilePage.jsx";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        setIsLoading(true);
        await API.getUserInfo();
      } catch {
        setLoggedIn(false);
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
      setLoggedIn(true);
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
      setLoggedIn(false);
      setUser(null);
      setMessage({ msg: "Logout successful!", type: "info" });
    } catch (err) {
      setMessage({ msg: err, type: "danger" });
    }
  };

  return (
    <Routes>
      <Route
        element={
          <DefaultLayout
            loggedIn={loggedIn}
            handleLogin={handleLogin}
            handleLogout={handleLogout}
            message={message}
            setMessage={setMessage}
            user={user}
          />
        }
      >
        <Route path="/" element={<HomePage loggedIn={loggedIn} />} />
        <Route
          path="/login"
          element={
            loggedIn ? (
              <Navigate replace to="/" />
            ) : (
              <LoginForm handleLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/play"
          element={
            isLoading ? (
              <div>Loading...</div>
            ) : loggedIn ? (
              <GamePage user={user} isLogged={loggedIn} />
            ) : (
              <Navigate replace to="/" />
            )
          }
        />
        <Route path="/demo" element={<GamePage isLogged={false} />} />
        <Route
          path="/profile"
          element={
            isLoading ? (
              <div>Loading...</div>
            ) : loggedIn ? (
              <ProfilePage user={user} />
            ) : (
              <Navigate replace to="/" />
            )
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
