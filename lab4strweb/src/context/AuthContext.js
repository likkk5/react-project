// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Для отображения загрузки

  // Загрузка состояния авторизации из сессии при монтировании
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/auth/status', {
          method: 'GET',
          credentials: 'include', // Включаем cookies сессии
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.isAuthenticated);
          setUser(data.user); // При успешной авторизации сохраняем данные пользователя
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Ошибка при получении статуса авторизации:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false); // Загрузка завершена
      }
    };

    checkAuthStatus();
  }, []);

  // Логика для входа в систему
  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  // Логика для выхода из системы
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
