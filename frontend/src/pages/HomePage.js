import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function HomePage({ user, onLogout }) {
  const [quotes, setQuotes] = useState([]);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [theme, setTheme] = useState('');
  const [mood, setMood] = useState('');
  const [style, setStyle] = useState('');
  const [search, setSearch] = useState('');
  const [filterTheme, setFilterTheme] = useState('');
  const [filterMood, setFilterMood] = useState('');
  const [filterStyle, setFilterStyle] = useState('');
  const [loading, setLoading] = useState(false);

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

  const resetSearch = () => {
    setSearch('');
    setFilterTheme('');
    setFilterMood('');
    setFilterStyle('');
    loadQuotes();
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  const createQuote = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('Введите текст цитаты');
      return;
    }
    try {
      await axios.post('/quotes', { text, author: author || 'Неизвестен', theme, mood, style });
      setText('');
      setAuthor('');
      setTheme('');
      setMood('');
      setStyle('');
      loadQuotes();
    } catch (error) {
      console.error('Ошибка создания:', error);
      if (error.response?.status === 401) {
        alert('Сессия истекла. Войдите заново.');
        onLogout();
      } else {
        alert('Ошибка при создании цитаты');
      }
    }
  };

  const deleteQuote = async (id) => {
    if (!window.confirm('Удалить цитату?')) return;
    try {
      await axios.delete(`/quotes/${id}`);
      loadQuotes();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      if (error.response?.status === 401) {
        alert('Сессия истекла. Войдите заново.');
        onLogout();
      } else {
        alert('Ошибка при удалении');
      }
    }
  };

  const likeQuote = async (id) => {
    try {
      await axios.post(`/quotes/${id}/like`);
      loadQuotes();
    } catch (error) {
      console.error('Ошибка лайка:', error);
      if (error.response?.status === 401) {
        alert('Сессия истекла. Войдите заново.');
        onLogout();
      }
    }
  };

  const searchQuotes = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterTheme) params.append('theme', filterTheme);
      if (filterMood) params.append('mood', filterMood);
      if (filterStyle) params.append('style', filterStyle);
      const response = await axios.get(`/quotes?${params.toString()}`);
      setQuotes(response.data);
    } catch (error) {
      console.error('Ошибка поиска:', error);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 700, margin: 'auto', padding: 20 }}>
      <h1>📚 QuoteGenius</h1>
      <p>Интеллектуальный генератор цитат</p>

      {!user ? (
        <div style={{ marginBottom: 30 }}>
          <Link to="/login">
            <button style={{ padding: '8px 16px', background: '#2196F3', color: 'white', border: 'none', borderRadius: 4 }}>Войти / Зарегистрироваться</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span>👋 Привет, {user.username}!</span>
          <button onClick={onLogout} style={{ padding: '6px 12px', background: '#f44336', color: 'white', border: 'none', borderRadius: 4 }}>Выйти</button>
        </div>
      )}

      {user && (
        <form onSubmit={createQuote} style={{ margin: '30px 0', padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
          <h2>➕ Добавить цитату</h2>
          <textarea rows={3} placeholder="Текст цитаты..." value={text} onChange={(e) => setText(e.target.value)} style={{ width: '100%', padding: 8 }} required />
          <input type="text" placeholder="Автор (необязательно)" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 8 }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} style={{ flex: 1, padding: 8 }}>
              <option value="">Тема (любая)</option>
              <option value="Любовь">Любовь</option>
              <option value="Мотивация">Мотивация</option>
              <option value="Дружба">Дружба</option>
              <option value="Жизнь">Жизнь</option>
              <option value="Юмор">Юмор</option>
              <option value="Философия">Философия</option>
            </select>
            <select value={mood} onChange={(e) => setMood(e.target.value)} style={{ flex: 1, padding: 8 }}>
              <option value="">Настроение (любое)</option>
              <option value="Вдохновляющее">Вдохновляющее</option>
              <option value="Грустное">Грустное</option>
              <option value="Весёлое">Весёлое</option>
              <option value="Спокойное">Спокойное</option>
            </select>
            <select value={style} onChange={(e) => setStyle(e.target.value)} style={{ flex: 1, padding: 8 }}>
              <option value="">Стиль (любой)</option>
              <option value="Классический">Классический</option>
              <option value="Современный">Современный</option>
              <option value="Ироничный">Ироничный</option>
              <option value="Поэтичный">Поэтичный</option>
            </select>
          </div>
          <button type="submit" style={{ marginTop: 8, padding: '8px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: 4 }}>Сохранить</button>
        </form>
      )}

      <form onSubmit={searchQuotes} style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          <input type="text" placeholder="Поиск цитат..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
          <button type="submit" style={{ padding: '8px 20px', background: '#2196F3', color: 'white', border: 'none', borderRadius: 4 }}>Найти</button>
          <button type="button" onClick={resetSearch} style={{ padding: '8px 20px', background: '#f44336', color: 'white', border: 'none', borderRadius: 4 }}>Сбросить</button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={filterTheme} onChange={(e) => setFilterTheme(e.target.value)} style={{ flex: 1, padding: 8 }}>
            <option value="">Тема (любая)</option>
            <option value="Любовь">Любовь</option>
            <option value="Мотивация">Мотивация</option>
            <option value="Дружба">Дружба</option>
            <option value="Жизнь">Жизнь</option>
            <option value="Юмор">Юмор</option>
            <option value="Философия">Философия</option>
          </select>
          <select value={filterMood} onChange={(e) => setFilterMood(e.target.value)} style={{ flex: 1, padding: 8 }}>
            <option value="">Настроение (любое)</option>
            <option value="Вдохновляющее">Вдохновляющее</option>
            <option value="Грустное">Грустное</option>
            <option value="Весёлое">Весёлое</option>
            <option value="Спокойное">Спокойное</option>
          </select>
          <select value={filterStyle} onChange={(e) => setFilterStyle(e.target.value)} style={{ flex: 1, padding: 8 }}>
            <option value="">Стиль (любой)</option>
            <option value="Классический">Классический</option>
            <option value="Современный">Современный</option>
            <option value="Ироничный">Ироничный</option>
            <option value="Поэтичный">Поэтичный</option>
          </select>
        </div>
      </form>

      <h2>📖 Все цитаты ({quotes.length})</h2>
      {loading && <p>Загрузка...</p>}
      {quotes.length === 0 && !loading && <p>Цитат пока нет. Добавьте первую!</p>}
      {quotes.map((q) => (
        <div key={q.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 15, marginBottom: 10 }}>
          <p style={{ fontSize: 18 }}>"{q.text}"</p>
          <p style={{ color: '#666' }}>— {q.author}</p>
          {(q.theme || q.mood || q.style) && (
            <p style={{ fontSize: 12, color: '#888' }}>
              {[q.theme && `Тема: ${q.theme}`, q.mood && `Настроение: ${q.mood}`, q.style && `Стиль: ${q.style}`].filter(Boolean).join(' · ')}
            </p>
          )}
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

export default HomePage;