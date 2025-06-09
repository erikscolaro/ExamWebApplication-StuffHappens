import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router";
import API from "./api/api.mjs";

// Layout Components (to be created)
import DefaultLayout from "./components/DefaultLayout";
import LoginForm from "./components/LoginForm";
import NotFound from "./components/NotFound";

// Game Components (to be created)
import HomePage from "./components/HomePage";
/*
import DemoGamePage from "./components/DemoGamePage";
import GamesHistoryPage from "./components/GameHistoryPage";
import PlayGamePage from "./components/PlayGame";
*/

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
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
      setMessage({msg: `Welcome, ${userResponse.user.username}!`, type: 'success'});
      setUser(userResponse.user);
    } catch(err) {
      setMessage({msg: err, type: 'danger'});
    }
  };

  const handleLogout = async () => {
    try {
      await API.logOut();
      setLoggedIn(false);
      setUser(null);
      setMessage({msg: 'Logged out successfully', type: 'info'});
    } catch {
      setMessage({msg: 'Error during logout', type: 'danger'});
    }
  };

  return (
    <Routes>
      <Route element={ <DefaultLayout loggedIn={loggedIn} handleLogout={handleLogout} message={message} setMessage={setMessage} user={user} /> } >
        {/* Home Page, instructions + demo button */}
        <Route path="/" element={ <HomePage loggedIn={loggedIn} /> } />
        
        {/* Authentication Routes */}
        <Route path='/login' element={loggedIn ? <Navigate replace to='/' /> : <LoginForm handleLogin={handleLogin} />} />
        
        <Route path="*" element={ <NotFound /> } />
      </Route>
    </Routes>
  )

}

export default App
