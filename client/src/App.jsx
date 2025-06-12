import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router";
import API from "./api/api.mjs";

// Layout Components
import DefaultLayout from "./components/DefaultLayout";
import NotFound from "./components/NotFound.jsx";

// Game Components
import HomePage from "./components/HomePage.jsx";
import { LoginForm } from "./components/AuthComponents.jsx";
import GamePage from "./components/game-page/GamePage.jsx";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const userInfo = await API.getUserInfo();
        setUser(userInfo.user);
        setLoggedIn(true);
      } catch {
        setLoggedIn(false);
      }
    };

    checkUserSession();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const userResponse = await API.logIn(credentials);
      setLoggedIn(true);
      setMessage({
        msg: `Benvenuto, ${userResponse.user.username}!`,
        type: "success",
      });
      setUser(userResponse.user);
    } catch (err) {
      setMessage({ msg: err, type: "danger" });
    }
  };
  const handleLogout = async () => {
    try {
      await API.logOut();
      setLoggedIn(false);
      setUser(null);
      setMessage({ msg: "Logout effettuato con successo!", type: "info" });
    } catch {
      setMessage({ msg: "Errore durante il logout", type: "danger" });
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
        {/* Home Page, instructions + demo button */}
        <Route path="/" element={<HomePage loggedIn={loggedIn} />} />
        {/* Demo Game Page */}
        <Route path="/demo" />
        {/* Authentication Routes */}
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

        {/* Protected Routes */}
        <Route path="/play" element={<GamePage user={user} />} />
        {/*<Route path="/profile" element={<ProfilePage user={user} />} />*/}

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
