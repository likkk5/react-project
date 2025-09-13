const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Получить всех пользователей (с поддержкой поиска и сортировки)
router.get('/', async (req, res) => {
  const { search, sortBy, order = 'asc' } = req.query;

  try {
    const query = search
      ? { username: new RegExp(search, 'i') } // Поиск по имени (регистронезависимый)
      : {};

    const sortCriteria = sortBy ? { [sortBy]: order === 'desc' ? -1 : 1 } : {};

    const users = await User.find(query).sort(sortCriteria);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      user,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создать нового пользователя
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { username, email, password, isCustomer, isEmployee, isAdmin } = req.body;
    const newUser = new User({ username, email, password, isCustomer, isEmployee, isAdmin });
    await newUser.save();
    res.status(201).json({ message: 'User created', user: newUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Обновить данные пользователя
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User updated', user: updatedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Удалить пользователя
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted', user: deletedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
