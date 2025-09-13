const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');
const Joi = require('joi');
const multer = require('multer');
const path = require('path');
// Схема для валидации продукта
const validateProduct = (data) => {
  const schema = Joi.object({
    code: Joi.string().required().messages({ 'any.required': 'Код продукта обязателен' }),
    name: Joi.string().required().messages({ 'any.required': 'Название продукта обязательно' }),
    price: Joi.number().positive().required().messages({
      'number.positive': 'Цена должна быть положительным числом',
      'any.required': 'Цена обязательна',
    }),
    characteristics: Joi.string().optional(),
    manufacturer: Joi.string().optional(),
    productType: Joi.string().optional(),
    // photo: Joi.string().uri().optional().messages({ 'string.uri': 'Фото должно быть валидным URL' }),
  });

  return schema.validate(data, { abortEarly: false });
};
// Настройка хранилища Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/media')); // Указываем папку "media" для сохранения файлов
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Уникальное имя файла
  },
});

// Фильтр для проверки формата файла
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Недопустимый формат файла. Разрешены только изображения.'));
  }
};
// Инициализация Multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Ограничение размера файла — 5 МБ
});
// Получить все продукты (с поддержкой поиска и сортировки)
router.get('/', async (req, res) => {
  const { search, sortBy, order = 'asc' } = req.query;

  try {
    const query = search
      ? { name: new RegExp(search, 'i') } // Поиск по имени (регистронезависимый)
      : {};

    const sortCriteria = sortBy ? { [sortBy]: order === 'desc' ? -1 : 1 } : {};

    const products = await Product.find(query).sort(sortCriteria);
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить продукт по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создать новый продукт
// на сервере
// router.post('/', authMiddleware, async (req, res) => {
//   console.log('Полученные данные:', req.body); // Логируем входящие данные

//   const { error } = validateProduct(req.body);
//   if (error) {
//     console.error('Ошибка валидации данных:', error.details); // Логируем ошибки валидации
//     return res.status(400).json({
//       message: 'Ошибка валидации',
//       details: error.details.map((err) => err.message),
//     });
//   }

//   try {
//     const { code, name, price, characteristics, manufacturer, productType, photo } = req.body;
//     console.log('Валидация прошла, сохраняем продукт'); // Лог перед сохранением
//     const newProduct = new Product({
//       code,
//       name,
//       price,
//       characteristics,
//       manufacturer,
//       productType,
//       photo,
//     });

//     await newProduct.save(); // Сохранение продукта
//     console.log('Продукт успешно сохранен:', newProduct); // Лог успешного сохранения

//     res.status(201).json({ message: 'Продукт успешно создан', product: newProduct });
//   } catch (err) {
//     console.error('Ошибка при сохранении продукта:', err); // Лог исключения

//     if (err.code === 11000) {
//       return res.status(400).json({
//         error: 'Продукт с таким кодом уже существует',
//       });
//     }

//     res.status(500).json({
//       error: 'Внутренняя ошибка сервера',
//       details: err.message,
//     });
//   }
// });
router.post('/', authMiddleware, upload.single('photo'), async (req, res) => {
  console.log('Полученные данные:', req.body);
  console.log('Загруженный файл:', req.file);

  const { error } = validateProduct(req.body);
  if (error) {
    return res.status(400).json({
      message: 'Ошибка валидации',
      details: error.details.map((err) => err.message),
    });
  }

  try {
    const { code, name, price, characteristics, manufacturer, productType } = req.body;

    const newProduct = new Product({
      code,
      name,
      price,
      characteristics,
      manufacturer,
      productType,
      photo: req.file ? req.file.filename : null, // Сохраняем имя файла, если файл загружен
    });

    await newProduct.save();
    res.status(201).json({ message: 'Продукт успешно создан', product: newProduct });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Продукт с таким кодом уже существует' });
    }
    res.status(500).json({ error: 'Внутренняя ошибка сервера', details: err.message });
  }
});

// Обновить продукт
// router.put('/:id', authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
//     if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
//     res.status(200).json({ message: 'Product updated', product: updatedProduct });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });
router.put('/:id', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;

    const updatedData = {
      code: req.body.code,
      name: req.body.name,
      price: req.body.price,
      characteristics: req.body.characteristics,
      manufacturer: req.body.manufacturer,
      productType: req.body.productType,
    };

    if (req.file) {
      updatedData.photo = req.file.filename; // Обновляем фото, если загружен новый файл
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }

    res.status(200).json({ message: 'Продукт успешно обновлен', product: updatedProduct });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Удалить продукт
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product deleted', product: deletedProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
