const mongoose = require('mongoose');
require('dotenv').config();

// Импорт моделей
const User = require('./models/User');
const Employee = require('./models/Employee');
const Product = require('./models/Product');
const Order = require('./models/Order');

// Подключение к базе данных
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => console.log('MongoDB connection error:', err));

// Функция для наполнения базы
const seedDatabase = async () => {
  try {
    // Очистка коллекций перед добавлением данных
    await User.deleteMany({});
    await Product.deleteMany({});
    await Employee.deleteMany({});
    await Order.deleteMany({});

    // Добавление пользователей
    const users = await User.create([
      { username: 'john_doe', email: 'john@example.com', password: 'password123', isCustomer: true },
      { username: 'jane_smith', email: 'jane@example.com', password: 'password123', isEmployee: true },
      { username: 'alice_williams', email: 'alice@example.com', password: 'password123', isCustomer: true },
      { username: 'bob_jones', email: 'bob@example.com', password: 'password123', isEmployee: true },
      { username: 'charlie_brown', email: 'charlie@example.com', password: 'password123', isCustomer: true },
      { username: 'david_white', email: 'david@example.com', password: 'password123', isEmployee: true },
      { username: 'eve_davis', email: 'eve@example.com', password: 'password123', isCustomer: true },
      { username: 'frank_martin', email: 'frank@example.com', password: 'password123', isEmployee: true },
      { username: 'grace_hall', email: 'grace@example.com', password: 'password123', isCustomer: true },
      { username: 'henry_lee', email: 'henry@example.com', password: 'password123', isEmployee: true }
    ]);

    // Добавление продуктов с реальными названиями автомобилей
    const products = await Product.create([
      { code: 'P001', name: 'Tesla Model S', price: 79999, manufacturer: 'Tesla', productType: 'Electric', characteristics: 'Fast, Luxury, Eco-Friendly' },
      { code: 'P002', name: 'BMW 3 Series', price: 45000, manufacturer: 'BMW', productType: 'Sedan', characteristics: 'Sporty, Comfortable, Premium' },
      { code: 'P003', name: 'Audi A4', price: 42000, manufacturer: 'Audi', productType: 'Sedan', characteristics: 'Elegant, Efficient, Comfortable' },
      { code: 'P004', name: 'Mercedes-Benz C-Class', price: 53000, manufacturer: 'Mercedes', productType: 'Sedan', characteristics: 'Luxury, Safe, Reliable' },
      { code: 'P005', name: 'Ford Mustang', price: 55000, manufacturer: 'Ford', productType: 'Coupe', characteristics: 'Powerful, Stylish, Classic' },
      { code: 'P006', name: 'Chevrolet Camaro', price: 62000, manufacturer: 'Chevrolet', productType: 'Coupe', characteristics: 'Muscle, Fast, Aggressive' },
      { code: 'P007', name: 'Toyota Corolla', price: 22000, manufacturer: 'Toyota', productType: 'Sedan', characteristics: 'Affordable, Reliable, Economical' },
      { code: 'P008', name: 'Honda Civic', price: 25000, manufacturer: 'Honda', productType: 'Sedan', characteristics: 'Compact, Efficient, Sporty' },
      { code: 'P009', name: 'Nissan Altima', price: 27000, manufacturer: 'Nissan', productType: 'Sedan', characteristics: 'Spacious, Efficient, Comfortable' },
      { code: 'P010', name: 'Porsche 911', price: 100000, manufacturer: 'Porsche', productType: 'Sports Car', characteristics: 'High Performance, Luxury, Iconic' }
    ]);

    // Добавление сотрудников (10 сотрудников)
    const employees = await Employee.create([
      { user: users[1]._id, position: 'Salesperson', phoneNumber: '+375-25-555-55-55', email: 'jane@example.com' },
      { user: users[3]._id, position: 'Manager', phoneNumber: '+375-25-555-55-56', email: 'bob@example.com' },
      { user: users[5]._id, position: 'Salesperson', phoneNumber: '+375-25-555-55-57', email: 'david@example.com' },
      { user: users[7]._id, position: 'Manager', phoneNumber: '+375-25-555-55-58', email: 'frank@example.com' },
      { user: users[9]._id, position: 'Salesperson', phoneNumber: '+375-25-555-55-59', email: 'henry@example.com' },
      { user: users[2]._id, position: 'Technician', phoneNumber: '+375-25-555-55-60', email: 'alice@example.com' },
      { user: users[4]._id, position: 'Technician', phoneNumber: '+375-25-555-55-61', email: 'charlie@example.com' },
      { user: users[6]._id, position: 'Salesperson', phoneNumber: '+375-25-555-55-62', email: 'eve@example.com' },
      { user: users[8]._id, position: 'Manager', phoneNumber: '+375-25-555-55-63', email: 'grace@example.com' },
      { user: users[0]._id, position: 'Technician', phoneNumber: '+375-25-555-55-64', email: 'john@example.com' }
    ]);

    // Добавление заказов
    const orders = await Order.create([
      { buyer: users[0]._id, product: products[0]._id, quantity: 1, price: 79999 },
      { buyer: users[2]._id, product: products[1]._id, quantity: 2, price: 90000 },
      { buyer: users[4]._id, product: products[2]._id, quantity: 1, price: 42000 },
      { buyer: users[6]._id, product: products[3]._id, quantity: 1, price: 53000 },
      { buyer: users[8]._id, product: products[4]._id, quantity: 1, price: 55000 },
      { buyer: users[1]._id, product: products[5]._id, quantity: 1, price: 62000 },
      { buyer: users[3]._id, product: products[6]._id, quantity: 2, price: 44000 },
      { buyer: users[5]._id, product: products[7]._id, quantity: 1, price: 25000 },
      { buyer: users[7]._id, product: products[8]._id, quantity: 1, price: 27000 },
      { buyer: users[9]._id, product: products[9]._id, quantity: 1, price: 100000 }
    ]);

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.connection.close();
  }
};

// Вызов функции для наполнения базы
seedDatabase();
