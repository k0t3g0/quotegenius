from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os
import re
import pymorphy3

load_dotenv()

app = Flask(__name__)
CORS(app)

# === Настройки ===
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///quotes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

jwt = JWTManager(app)
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
morph = pymorphy3.MorphAnalyzer()

# === Модели ===
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

class Quote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500), nullable=False)
    author = db.Column(db.String(100), default='Неизвестен')
    lemmas = db.Column(db.String(500), default='')
    likes = db.Column(db.Integer, default=0)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

# === Упрощённая лемматизация ===
STOP_WORDS = {'и', 'в', 'на', 'с', 'по', 'к', 'у', 'за', 'из', 'о', 'об', 'от', 'для', 'при', 'через', 'между', 'без', 'до', 'про', 'как', 'так', 'вот', 'это', 'быть', 'весь', 'свой', 'тот', 'этот', 'такой', 'сам', 'очень', 'ещё', 'уже', 'только', 'если', 'чтобы', 'потому', 'поэтому', 'тогда', 'там', 'здесь', 'куда', 'откуда'}

def simple_lemmatize(text):
    text = text.lower()
    tokens = re.findall(r'\b[а-яё]+\b', text)
    result = []
    for token in tokens:
        if token in STOP_WORDS or len(token) <= 2:
            continue
        lemma = morph.parse(token)[0].normal_form
        result.append(lemma)
    return ' '.join(result)

# === Создание базы ===
with app.app_context():
    db.create_all()
    print("✅ База готова!")

# === Регистрация ===
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return {"error": "Логин и пароль обязательны"}, 400

    if User.query.filter_by(username=username).first():
        return {"error": "Пользователь уже существует"}, 400

    hashed = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(username=username, password=hashed)
    db.session.add(user)
    db.session.commit()
    return {"message": "Пользователь создан"}, 201
# === Логин ===
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return {"error": "Неверный логин или пароль"}, 401

    access_token = create_access_token(
    identity=str(user.id),
    additional_claims={"username": user.username}
)
    return {"access_token": access_token}, 200

# === Создание цитаты (только для авторизованных) ===
@app.route('/quotes', methods=['POST'])
@jwt_required()
def create_quote():
    user_id = int(get_jwt_identity())
    data = request.json

    if not data or not data.get('text'):
        return {"error": "Текст обязателен"}, 400

    lemmas = simple_lemmatize(data['text'])

    quote = Quote(
        text=data['text'],
        author=data.get('author', 'Неизвестен'),
        lemmas=lemmas,
        user_id=user_id
    )
    db.session.add(quote)
    db.session.commit()
    return {"message": "Цитата создана!", "id": quote.id, "lemmas": lemmas}, 201

# === Получение цитат (открытая ручка) ===
@app.route('/quotes', methods=['GET'])
def get_quotes():
    search = request.args.get('search', '')
    if search:
        search_lemmas = simple_lemmatize(search)
        quotes = Quote.query.filter(Quote.lemmas.contains(search_lemmas)).all()
    else:
        quotes = Quote.query.all()

    return jsonify([{
        "id": q.id,
        "text": q.text,
        "author": q.author,
        "lemmas": q.lemmas,
        "likes": q.likes
    } for q in quotes])

# === Лайк (только для авторизованных) ===
@app.route('/quotes/<int:quote_id>/like', methods=['POST'])
@jwt_required()
def like_quote(quote_id):
    quote = Quote.query.get(quote_id)
    if not quote:
        return {"error": "Не найдено"}, 404
    quote.likes += 1
    db.session.commit()
    return {"message": "Лайк!", "likes": quote.likes}, 200

# === Удаление (только для авторизованных и владельца) ===
@app.route('/quotes/<int:quote_id>', methods=['DELETE'])
@jwt_required()
def delete_quote(quote_id):
    user_id = int(get_jwt_identity())
    quote = Quote.query.get(quote_id)

    if not quote:
        return {"error": "Не найдено"}, 404
    if quote.user_id != user_id:
        return {"error": "Не ваша цитата"}, 403

    db.session.delete(quote)
    db.session.commit()
    return {"message": "Удалено"}, 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)