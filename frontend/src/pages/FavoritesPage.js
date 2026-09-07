import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function FavoritesPage({ user, onLogout }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/favorites');
      setFavorites(response.data);
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
      if (error.response?.status === 401) {
        alert('Сессия истекла. Войдите заново.');
        onLogout();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadFavorites();
  }, [user]);

  const removeFavorite = async (id) => {
    try {
      await axios.delete(`/quotes/${id}/favorite`);
      loadFavorites();
    } catch (error) {
      console.error('Ошибка удаления из избранного:', error);
    }
  };

  const likeQuote = async (id) => {
    try {
      await axios.post(`/quotes/${id}/like`);
      loadFavorites();
    } catch (error) {
      console.error('Ошибка лайка:', error);
    }
  };

  if (!user) {
    return (
      <div className="container py-4" style={{ maxWidth: 700 }}>
        <h1>📚 QuoteGenius</h1>
        <p>Чтобы посмотреть избранное, нужно войти.</p>
        <Link to="/login" className="btn btn-primary">Войти / Зарегистрироваться</Link>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 700 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0">⭐ Избранное</h1>
        <Link to="/" className="btn btn-outline-secondary btn-sm">← Все цитаты</Link>
      </div>

      {loading && <p>Загрузка...</p>}
      {favorites.length === 0 && !loading && <p>Пока пусто — добавь цитаты в избранное на главной странице.</p>}
      {favorites.map((q) => (
        <div key={q.id} className="card mb-3">
          <div className="card-body">
            <p className="fs-5">"{q.text}"</p>
            <p className="text-muted">— {q.author}</p>
            {(q.theme || q.mood || q.style) && (
              <p className="mb-1">
                {q.theme && <span className="badge text-bg-light me-1">Тема: {q.theme}</span>}
                {q.mood && <span className="badge text-bg-light me-1">Настроение: {q.mood}</span>}
                {q.style && <span className="badge text-bg-light me-1">Стиль: {q.style}</span>}
              </p>
            )}
            <div className="mt-2">
              <button onClick={() => likeQuote(q.id)} className="btn btn-primary btn-sm me-2">❤️ {q.likes || 0}</button>
              <button onClick={() => removeFavorite(q.id)} className="btn btn-warning btn-sm">★ Убрать из избранного</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FavoritesPage;