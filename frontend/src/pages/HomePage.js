import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const quoteSchema = yup.object({
  text: yup.string().trim().required('Введите текст цитаты'),
  author: yup.string(),
  theme: yup.string(),
  mood: yup.string(),
  style: yup.string(),
});

function HomePage({ user, onLogout }) {
  const [quotes, setQuotes] = useState([]);
  const [search, setSearch] = useState('');
  const [filterTheme, setFilterTheme] = useState('');
  const [filterMood, setFilterMood] = useState('');
  const [filterStyle, setFilterStyle] = useState('');
  const [loading, setLoading] = useState(false);

  const quoteForm = useForm({
    resolver: yupResolver(quoteSchema),
    defaultValues: { text: '', author: '', theme: '', mood: '', style: '' },
  });

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

  const onCreateQuote = async (data) => {
    try {
      await axios.post('/quotes', { ...data, author: data.author || 'Неизвестен' });
      quoteForm.reset();
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
    <div className="container py-4" style={{ maxWidth: 700 }}>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h1 className="mb-0">📚 QuoteGenius</h1>
        {user && (
          <div className="d-flex align-items-center gap-3">
            <span>👋 {user.username}</span>
            <button onClick={onLogout} className="btn btn-outline-danger btn-sm">Выйти</button>
          </div>
        )}
      </div>
      <p className="text-muted">Интеллектуальный генератор цитат</p>

      {!user && (
        <Link to="/login" className="btn btn-primary mb-4">Войти / Зарегистрироваться</Link>
      )}

      {user && (
        <div className="card mb-4">
          <div className="card-body">
            <h2 className="h5">➕ Добавить цитату</h2>
            <form onSubmit={quoteForm.handleSubmit(onCreateQuote)} noValidate>
              <div className="mb-2">
                <textarea
                  rows={3}
                  placeholder="Текст цитаты..."
                  className={`form-control ${quoteForm.formState.errors.text ? 'is-invalid' : ''}`}
                  {...quoteForm.register('text')}
                />
                {quoteForm.formState.errors.text && (
                  <div className="invalid-feedback">{quoteForm.formState.errors.text.message}</div>
                )}
              </div>
              <input
                type="text"
                placeholder="Автор (необязательно)"
                className="form-control mb-2"
                {...quoteForm.register('author')}
              />
              <div className="row g-2 mb-2">
                <div className="col">
                  <select className="form-select" {...quoteForm.register('theme')}>
                    <option value="">Тема (любая)</option>
                    <option value="Любовь">Любовь</option>
                    <option value="Мотивация">Мотивация</option>
                    <option value="Дружба">Дружба</option>
                    <option value="Жизнь">Жизнь</option>
                    <option value="Юмор">Юмор</option>
                    <option value="Философия">Философия</option>
                  </select>
                </div>
                <div className="col">
                  <select className="form-select" {...quoteForm.register('mood')}>
                    <option value="">Настроение (любое)</option>
                    <option value="Вдохновляющее">Вдохновляющее</option>
                    <option value="Грустное">Грустное</option>
                    <option value="Весёлое">Весёлое</option>
                    <option value="Спокойное">Спокойное</option>
                  </select>
                </div>
                <div className="col">
                  <select className="form-select" {...quoteForm.register('style')}>
                    <option value="">Стиль (любой)</option>
                    <option value="Классический">Классический</option>
                    <option value="Современный">Современный</option>
                    <option value="Ироничный">Ироничный</option>
                    <option value="Поэтичный">Поэтичный</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-success">Сохранить</button>
            </form>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={searchQuotes}>
            <div className="d-flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Поиск цитат..."
                className="form-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-primary text-nowrap">Найти</button>
              <button type="button" onClick={resetSearch} className="btn btn-outline-secondary text-nowrap">Сбросить</button>
            </div>
            <div className="row g-2">
              <div className="col">
                <select className="form-select" value={filterTheme} onChange={(e) => setFilterTheme(e.target.value)}>
                  <option value="">Тема (любая)</option>
                  <option value="Любовь">Любовь</option>
                  <option value="Мотивация">Мотивация</option>
                  <option value="Дружба">Дружба</option>
                  <option value="Жизнь">Жизнь</option>
                  <option value="Юмор">Юмор</option>
                  <option value="Философия">Философия</option>
                </select>
              </div>
              <div className="col">
                <select className="form-select" value={filterMood} onChange={(e) => setFilterMood(e.target.value)}>
                  <option value="">Настроение (любое)</option>
                  <option value="Вдохновляющее">Вдохновляющее</option>
                  <option value="Грустное">Грустное</option>
                  <option value="Весёлое">Весёлое</option>
                  <option value="Спокойное">Спокойное</option>
                </select>
              </div>
              <div className="col">
                <select className="form-select" value={filterStyle} onChange={(e) => setFilterStyle(e.target.value)}>
                  <option value="">Стиль (любой)</option>
                  <option value="Классический">Классический</option>
                  <option value="Современный">Современный</option>
                  <option value="Ироничный">Ироничный</option>
                  <option value="Поэтичный">Поэтичный</option>
                </select>
              </div>
            </div>
          </form>
        </div>
      </div>

      <h2 className="h5">📖 Все цитаты ({quotes.length})</h2>
      {loading && <p>Загрузка...</p>}
      {quotes.length === 0 && !loading && <p>Цитат пока нет. Добавьте первую!</p>}
      {quotes.map((q) => (
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
            {q.lemmas && <p className="text-muted small">Леммы: {q.lemmas}</p>}
            {user && (
              <div className="mt-2">
                <button onClick={() => likeQuote(q.id)} className="btn btn-primary btn-sm me-2">❤️ {q.likes || 0}</button>
                <button onClick={() => deleteQuote(q.id)} className="btn btn-danger btn-sm">Удалить</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default HomePage;