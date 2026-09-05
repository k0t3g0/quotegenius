import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const authSchema = yup.object({
  username: yup.string().required('Введите логин'),
  password: yup.string().required('Введите пароль').min(4, 'Минимум 4 символа'),
});

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState('');

  const loginForm = useForm({ resolver: yupResolver(authSchema) });
  const registerForm = useForm({ resolver: yupResolver(authSchema) });

  const onLoginSubmit = async (data) => {
    setAuthError('');
    try {
      const response = await axios.post('/login', data);
      onLogin(response.data.access_token);
      navigate('/');
    } catch (error) {
      setAuthError(error.response?.data?.error || 'Ошибка входа');
    }
  };

  const onRegisterSubmit = async (data) => {
    setAuthError('');
    try {
      await axios.post('/register', data);
      alert('Регистрация успешна! Теперь войдите.');
      registerForm.reset();
    } catch (error) {
      setAuthError(error.response?.data?.error || 'Ошибка регистрации');
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: 'auto', padding: 20 }}>
      <h1>📚 QuoteGenius</h1>
      <p><Link to="/">← Вернуться к цитатам</Link></p>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} style={{ flex: 1, border: '1px solid #ccc', padding: 15, borderRadius: 8 }}>
          <h3>Вход</h3>
          <input type="text" placeholder="Логин" {...loginForm.register('username')} style={{ width: '100%', padding: 8, marginBottom: 4 }} />
          {loginForm.formState.errors.username && <p style={{ color: 'red', fontSize: 13, margin: '0 0 8px' }}>{loginForm.formState.errors.username.message}</p>}
          <input type="password" placeholder="Пароль" {...loginForm.register('password')} style={{ width: '100%', padding: 8, marginBottom: 4 }} />
          {loginForm.formState.errors.password && <p style={{ color: 'red', fontSize: 13, margin: '0 0 8px' }}>{loginForm.formState.errors.password.message}</p>}
          <button type="submit" style={{ padding: '8px 16px', background: '#2196F3', color: 'white', border: 'none', borderRadius: 4 }}>Войти</button>
        </form>

        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} style={{ flex: 1, border: '1px solid #ccc', padding: 15, borderRadius: 8 }}>
          <h3>Регистрация</h3>
          <input type="text" placeholder="Логин" {...registerForm.register('username')} style={{ width: '100%', padding: 8, marginBottom: 4 }} />
          {registerForm.formState.errors.username && <p style={{ color: 'red', fontSize: 13, margin: '0 0 8px' }}>{registerForm.formState.errors.username.message}</p>}
          <input type="password" placeholder="Пароль" {...registerForm.register('password')} style={{ width: '100%', padding: 8, marginBottom: 4 }} />
          {registerForm.formState.errors.password && <p style={{ color: 'red', fontSize: 13, margin: '0 0 8px' }}>{registerForm.formState.errors.password.message}</p>}
          <button type="submit" style={{ padding: '8px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: 4 }}>Зарегистрироваться</button>
        </form>
      </div>
      {authError && <p style={{ color: 'red', marginTop: 15 }}>{authError}</p>}
    </div>
  );
}

export default LoginPage;