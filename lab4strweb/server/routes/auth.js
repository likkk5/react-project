const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Пользователь уже существует' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: 'Пользователь создан' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Локальная аутентификация
// router.post('/login', passport.authenticate('local', {
//   successRedirect: '/dashboard',
//   failureRedirect: '/login',
//   failureFlash: true
// }));
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err); // Обработка ошибок
    if (!user) return res.status(400).json({ message: info.message }); // Неверные данные

    // Авторизация пользователя
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ message: 'Успешный вход', user });
    });
  })(req, res, next);
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', {
  successRedirect: 'http://localhost:3000/dashboard', // Перенаправление на фронтенд
  failureRedirect: 'http://localhost:3000/login' // В случае ошибки редирект на страницу логина на фронтенде
}));

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebook/callback', passport.authenticate('facebook', {
  successRedirect: 'http://localhost:3000/dashboard', // Перенаправление на фронтенд
  failureRedirect: 'http://localhost:3000/login' // В случае ошибки редирект на страницу логина на фронтенде
}));
// Отладочный маршрут для проверки сессии
router.get('/debug-session', (req, res) => {
  res.json({
    isAuthenticated: req.isAuthenticated(),
    session: req.session,
    user: req.user || 'Пользователь не сохранен в сессии'
  });
});
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ isAuthenticated: true, user: req.user });
  } else {
    return res.json({ isAuthenticated: false, user: null });
  }
});
// router.get('/protected-route', authMiddleware, (req, res) => {
//   res.json({ message: 'Вы авторизованы!', user: req.user });
// });

// Выход
router.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
});

module.exports = router;
