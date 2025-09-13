const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const passport = require('./server/config/passport');
const moment = require('moment-timezone');
const app = express();
// app.use(cors());
app.use(cors({
  origin: 'http://localhost:3000', // Ваш фронтенд
  credentials: true // Включить отправку cookies
}));

app.use(express.json());

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: '123456', // Замените на безопасный ключ
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, // Безопасность
    secure: false, // true, если используете HTTPS
    maxAge: 60 * 60 * 1000 // Время жизни cookie (1 день)
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Импорт маршрутов
const authRoutes = require('./server/routes/auth');
const userRoutes = require('./server/routes/users');
const productRoutes = require('./server/routes/products');
const orderRoutes = require('./server/routes/orders');
const employeeRoutes = require('./server/routes/employees');
// Подключение маршрутов
app.use('/auth', authRoutes);
app.use('/dashboard', require('./server/routes/auth'));
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ message: 'Добро пожаловать в панель управления!', user: req.user });
  } else {
    res.status(401).json({ message: 'Пожалуйста, авторизуйтесь.' });
  }
});
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка при выходе' });
    }
    req.session.destroy((err) => { // Уничтожаем сессию
      if (err) {
        return res.status(500).json({ message: 'Не удалось уничтожить сессию' });
      }
      res.clearCookie('connect.sid'); // Удаляем cookie сессии
      return res.status(200).json({ message: 'Вы успешно вышли' });
    });
  });
});

// Настраиваем папку media как статическую
app.use('/media', express.static(path.join(__dirname, '../../public/media')));
// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
