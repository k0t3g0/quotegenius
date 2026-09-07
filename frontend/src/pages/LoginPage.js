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
    <div className="container py-5" style={{ maxWidth: 700 }}>
      <h1 className="mb-1">📚 QuoteGenius</h1>
      <Link to="/" className="d-inline-block mb-4">← Вернуться к цитатам</Link>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="card-title h5">Вход</h3>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} noValidate>
                <div className="mb-3">
                  <label className="form-label">Логин</label>
                  <input
                    type="text"
                    className={`form-control ${loginForm.formState.errors.username ? 'is-invalid' : ''}`}
                    {...loginForm.register('username')}
                  />
                  {loginForm.formState.errors.username && (
                    <div className="invalid-feedback">{loginForm.formState.errors.username.message}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Пароль</label>
                  <input
                    type="password"
                    className={`form-control ${loginForm.formState.errors.password ? 'is-invalid' : ''}`}
                    {...loginForm.register('password')}
                  />
                  {loginForm.formState.errors.password && (
                    <div className="invalid-feedback">{loginForm.formState.errors.password.message}</div>
                  )}
                </div>
                <button type="submit" className="btn btn-primary w-100">Войти</button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="card-title h5">Регистрация</h3>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} noValidate>
                <div className="mb-3">
                  <label className="form-label">Логин</label>
                  <input
                    type="text"
                    className={`form-control ${registerForm.formState.errors.username ? 'is-invalid' : ''}`}
                    {...registerForm.register('username')}
                  />
                  {registerForm.formState.errors.username && (
                    <div className="invalid-feedback">{registerForm.formState.errors.username.message}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Пароль</label>
                  <input
                    type="password"
                    className={`form-control ${registerForm.formState.errors.password ? 'is-invalid' : ''}`}
                    {...registerForm.register('password')}
                  />
                  {registerForm.formState.errors.password && (
                    <div className="invalid-feedback">{registerForm.formState.errors.password.message}</div>
                  )}
                </div>
                <button type="submit" className="btn btn-success w-100">Зарегистрироваться</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {authError && <div className="alert alert-danger mt-4">{authError}</div>}
    </div>
  );
}

export default LoginPage;