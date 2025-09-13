import React, { useContext } from 'react';
import './css/App.css';
import { Route, Routes, Link } from 'react-router-dom';
import Products from './components/Products';
import ProductDetails from './components/ProductDetails';
import Users from './components/Users';
import Orders from './components/Orders';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Employees from './components/Employees';
import { AuthProvider, AuthContext } from './context/AuthContext';

const Navigation = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        logout(); // Обновить состояние аутентификации
        alert('Вы успешно вышли');
      } else {
        alert('Ошибка выхода');
      }
    } catch (error) {
      alert('Ошибка запроса: ' + error.message);
    }
  };

  return (
    <nav>
      <ul>
        <li><Link to="/products">Продукты</Link></li>
        <li><Link to="/users">Пользователи</Link></li>
        <li><Link to="/employees">Сотрудники</Link></li>
        <li><Link to="/orders">Заказы</Link></li>
        <li><Link to="/dashboard">Главная</Link></li>
        <div className="auth-section">
        {!isAuthenticated ? (
          <>
            <li><Link to="/login">Войти</Link></li>
            <li><Link to="/register">Регистрация</Link></li>
          </>
        ) : (
          <>
            <span>{user?.username || 'Гость'}</span>
            <button onClick={handleLogout} className="logout-button">
              Выйти
            </button>
          </>
        )}
      </div>
      </ul>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <header className="App-header">
          <h1>Автосалон</h1>
          <Navigation />
        </header>

        <Routes>
          <Route path="/products" element={<Products />} />
          <Route path="/users" element={<Users />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route
                path="/"
                element={
                  <div className="centered-content">
                    <h1>Добро пожаловать в автосалон!</h1>
                  </div>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
