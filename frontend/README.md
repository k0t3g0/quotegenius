# QuoteGenius — Интеллектуальный генератор цитат

Полноценное full-stack приложение: пользователи регистрируются, добавляют цитаты с темой/настроением/стилем, ищут их по смыслу (через лемматизацию), лайкают, сохраняют в избранное.

## Технологии

**Backend:** Python, Flask, Flask-JWT-Extended, Flask-CORS, Flask-Bcrypt, Flask-SQLAlchemy (SQLite), python-dotenv, pymorphy3 (лемматизация русского текста)

**Frontend:** React, React Router v6, Axios, React Hook Form + Yup, Bootstrap

## Возможности

- Регистрация и вход по логину/паролю (JWT)
- Добавление цитат с темой, настроением, стилем и автором
- Поиск по смыслу слова (через лемматизацию), а не только по точному совпадению текста
- Фильтрация по теме/настроению/стилю
- Лайки (публичный счётчик)
- Избранное — личный список цитат каждого пользователя (отдельно от лайков)
- 50 стартовых цитат в базе из коробки

## Запуск

### Backend

cd backend
python -m venv venv
venv\Scripts\activate # Windows
pip install -r requirements.txt
python app.py

Сервер запустится на `http://localhost:5000`. Нужен файл `.env` с переменной `JWT_SECRET_KEY`.

### Frontend

cd frontend
npm install
npm start

Приложение откроется на `http://localhost:3000`.

## Структура проекта
quotegenius/
├── backend/
│ ├── app.py — Flask-сервер, модели, все API-роуты
│ ├── seed.py — заполнение базы стартовыми цитатами
│ └── .env — секретный ключ JWT (не в репозитории)
└── frontend/
└── src/
├── App.js — роутинг, состояние авторизации
└── pages/
├── HomePage.js — список, поиск, добавление цитат
├── LoginPage.js — вход и регистрация
└── FavoritesPage.js — избранные цитаты