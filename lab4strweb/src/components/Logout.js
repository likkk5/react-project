import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        logout(); // Сброс состояния авторизации в контексте
        alert('Вы успешно вышли');
        navigate('/login');
      } else {
        const data = await response.json();
        alert(`Ошибка выхода: ${data.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      alert(`Ошибка запроса: ${error.message}`);
    }
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Выйти
    </button>
  );
};

export default LogoutButton;
