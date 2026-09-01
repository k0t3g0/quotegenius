import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const [quotes, setQuotes] = useState([]);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // === Настройка axios с токеном ===
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: payload.sub || 'User' });
      } catch {
        setUser({ username: 'User' });
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [token]);

  // === Загрузка цитат ===
  const loadQuotes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/quotes');
      setQuotes(response.data);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  // === Регистрация ===
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      await axios.post('/register', {
        username: regUsername,
        password: regPassword,
      });
      alert('Регистрация успешна! Теперь войдите.');
      setRegUsername('');
      setRegPassword('');
    } catch (error) {
      setAuthError(error.response?.data?.error || 'Ошибка регистрации');
    }
  };

  // === Логин ===
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await axios.post('/login', {
        username: loginUsername,
        password: loginPassword,
      });
      const newToken = response.data.access_token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      setLoginUsername('');
      setLoginPassword('');
    } catch (error) {
      setAuthError(error.response?.data?.error || 'Ошибка входа');
    }
  };

  // === Выход ===
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  // === Создание цитаты ===
  const createQuote = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('Введите текст цитаты');
      return;
    }
    try {
      await axios.post('/quotes', { text, author: author || 'Неизвестен' });
      setText('');
      setAuthor('');
      loadQuotes();
    } catch (error) {
      console.error('Ошибка создания:', error);
      if (error.response?.status === 401) {
        alert('Сессия истекла. Войдите заново.');
        handleLogout();
      } else {
        alert('Ошибка при создании цитаты');
      }
    }
  };

  // === Удаление ===
  const deleteQuote = async (id) => {
    if (!window.confirm('Удалить цитату?')) return;
    try {
      await axios.delete(`/quotes/${id}`);
      loadQuotes();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      if (error.response?.status === 401) {
        alert('Сессия истекла. Войдите заново.');
        handleLogout();
      } else {
        alert('Ошибка при удалении');
      }
    }
  };

  // === Лайк ===
  const likeQuote = async (id) => {
    try {
      await axios.post(`/quotes/${id}/like`);
      loadQuotes();
    } catch (error) {
      console.error('Ошибка лайка:', error);
      if (error.response?.status === 401) {
        alert('Сессия истекла. Войдите заново.');
        handleLogout();
      }
    }
  };

  // === Поиск ===
  const searchQuotes = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.get(`/quotes?search=${search}`);
      setQuotes(response.data);
    } catch (error) {
      console.error('Ошибка поиска:', error);
    }
    setLoading(false);
  };

  const resetSearch = () => {
    setSearch('');
    loadQuotes();
  };

  return (
    <div style={{ maxWidth: 700, margin: 'auto', padding: 20 }}>
      <h1>📚 QuoteGenius</h1>
      <p>Интеллектуальный генератор цитат</p>

      {/* Блок авторизации */}
      {!user ? (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 30 }}>
          <form onSubmit={handleLogin} style={{ flex: 1, border: '1px solid #ccc', padding: 15, borderRadius: 8 }}>
            <h3>Вход</h3>
            <input type="text" placeholder="Логин" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} required />
            <input type="password" placeholder="Пароль" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} required />
            <button type="submit" style={{ padding: '8px 16px', background: '#2196F3', color: 'white', border: 'none', borderRadius: 4 }}>Войти</button>
          </form>

          <form onSubmit={handleRegister} style={{ flex: 1, border: '1px solid #ccc', padding: 15, borderRadius: 8 }}>
            <h3>Регистрация</h3>
            <input type="text" placeholder="Логин" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} required />
            <input type="password" placeholder="Пароль" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} required />
            <button type="submit" style={{ padding: '8px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: 4 }}>Зарегистрироваться</button>
          </form>
          {authError && <p style={{ color: 'red', width: '100%' }}>{authError}</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span>👋 Привет, {user.username}!</span>
          <button onClick={handleLogout} style={{ padding: '6px 12px', background: '#f44336', color: 'white', border: 'none', borderRadius: 4 }}>Выйти</button>
        </div>
      )}

      {/* Форма создания цитаты (только для авторизованных) */}
      {user && (
        <form onSubmit={createQuote} style={{ margin: '30px 0', padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
          <h2>➕ Добавить цитату</h2>
          <textarea rows={3} placeholder="Текст цитаты..." value={text} onChange={(e) => setText(e.target.value)} style={{ width: '100%', padding: 8 }} required />
          <input type="text" placeholder="Автор (необязательно)" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 8 }} />
          <button type="submit" style={{ marginTop: 8, padding: '8px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: 4 }}>Сохранить</button>
        </form>
      )}

      {/* Поиск (доступен всем) */}
      <form onSubmit={searchQuotes} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input type="text" placeholder="Поиск цитат..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
        <button type="submit" style={{ padding: '8px 20px', background: '#2196F3', color: 'white', border: 'none', borderRadius: 4 }}>Найти</button>
        <button type="button" onClick={resetSearch} style={{ padding: '8px 20px', background: '#f44336', color: 'white', border: 'none', borderRadius: 4 }}>Сбросить</button>
      </form>

      {/* Список цитат */}
      <h2>📖 Все цитаты ({quotes.length})</h2>
      {loading && <p>Загрузка...</p>}
      {quotes.length === 0 && !loading && <p>Цитат пока нет. Добавьте первую!</p>}
      {quotes.map((q) => (
        <div key={q.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 15, marginBottom: 10 }}>
          <p style={{ fontSize: 18 }}>"{q.text}"</p>
          <p style={{ color: '#666' }}>— {q.author}</p>
          {q.lemmas && <p style={{ fontSize: 12, color: '#999' }}>Леммы: {q.lemmas}</p>}
          {user && (
            <div style={{ marginTop: 10 }}>
              <button onClick={() => likeQuote(q.id)} style={{ marginRight: 10, padding: '5px 15px', background: '#2196F3', color: 'white', border: 'none', borderRadius: 4 }}>❤️ {q.likes || 0}</button>
              <button onClick={() => deleteQuote(q.id)} style={{ padding: '5px 15px', background: '#ff4444', color: 'white', border: 'none', borderRadius: 4 }}>Удалить</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default App;