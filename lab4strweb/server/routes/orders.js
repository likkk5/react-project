const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

// Получить все заказы (с поддержкой поиска и сортировки)
router.get('/', async (req, res) => {
  const { search, sortBy, order = 'asc' } = req.query;

  try {
    const query = search
      ? { 'buyer.username': new RegExp(search, 'i') } // Поиск по имени покупателя
      : {};

    const sortCriteria = sortBy ? { [sortBy]: order === 'desc' ? -1 : 1 } : {};

    const orders = await Order.find(query)
      .populate('buyer', 'username email') // Подтягиваем данные покупателя
      .populate('product', 'name price') // Подтягиваем данные продукта
      .sort(sortCriteria);

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создать новый заказ
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { buyer, product, quantity, promoCode } = req.body;

    const productData = await Product.findById(product);
    if (!productData) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const totalPrice = productData.price * (quantity || 1);

    const newOrder = new Order({
      buyer,
      product,
      quantity: quantity || 1,
      price: totalPrice,
      promoCode,
    });

    await newOrder.save();
    res.status(201).json({ message: 'Order created', order: newOrder });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Обновить заказ
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, promoCode } = req.body;

    const order = await Order.findById(id).populate('product');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (quantity) {
      order.quantity = quantity;
      order.price = order.product.price * quantity;
    }

    if (promoCode) {
      order.promoCode = promoCode;
    }

    await order.save();
    res.status(200).json({ message: 'Order updated', order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Удалить заказ
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted', order: deletedOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
