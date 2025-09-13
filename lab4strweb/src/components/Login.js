// src/components/Login.js
import '../css/Login.css';
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Импорт контекста

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Получаем метод login из контекста

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user); // Обновляем состояние контекста
        navigate('/dashboard'); // Перенаправление на Dashboard
      } else {
        alert(data.message || 'Ошибка при входе');
      }
    } catch (error) {
      alert(`Ошибка запроса: ${error.message}`);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Вход в систему</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
          />
          <button type="submit">Войти</button>
        </form>
        <a href="http://localhost:5000/auth/google">Войти через Google</a>
      </div>
    </div>
  );
};

export default Login;
