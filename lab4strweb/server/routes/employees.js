const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Получить всех сотрудников с возможностью поиска и сортировки
router.get('/', async (req, res) => {
  const { search, sortBy, order = 'asc' } = req.query;

  try {
    const query = search
      ? { position: new RegExp(search, 'i') } // Поиск по позиции
      : {};

    const sortCriteria = sortBy ? { [sortBy]: order === 'desc' ? -1 : 1 } : {};

    const employees = await Employee.find(query).populate('user', 'username email').sort(sortCriteria);
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создать нового сотрудника
router.post('/', async (req, res) => {
  try {
    const { user, position, phoneNumber, email, startDate, birthDate, photo } = req.body;

    const newEmployee = new Employee({
      user,
      position,
      phoneNumber,
      email,
      startDate,
      birthDate,
      photo,
    });

    await newEmployee.save();
    res.status(201).json({ message: 'Employee created', employee: newEmployee });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Удалить сотрудника
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEmployee = await Employee.findByIdAndDelete(id);
    if (!deletedEmployee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json({ message: 'Employee deleted', employee: deletedEmployee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить данные сотрудника
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEmployee = await Employee.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedEmployee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json({ message: 'Employee updated', employee: updatedEmployee });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
