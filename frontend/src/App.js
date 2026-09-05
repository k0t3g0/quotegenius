import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: payload.username || 'User' });
      } catch {
        setUser({ username: 'User' });
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [token]);

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage user={user} onLogout={handleLogout} />} />
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
    </Routes>
  );
}

export default App;