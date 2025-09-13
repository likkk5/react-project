import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment-timezone'; // Импортируем библиотеку для работы с временными зонами
import '../css/Dashboard.css';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const Dashboard = () => {
  const { isAuthenticated, user } = useContext(AuthContext);

  // Состояния
  const [weather, setWeather] = useState(null);
  const [cars, setCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [currentDate, setCurrentDate] = useState(null);
  const [userTimezone, setUserTimezone] = useState(moment.tz.guess()); // Получаем временную зону пользователя
  const [userCoordinates, setUserCoordinates] = useState(null); // Сохраняем координаты пользователя

  // Временные данные пользователя
  const [userCreatedAt, setUserCreatedAt] = useState(null);
  const [userUpdatedAt, setUserUpdatedAt] = useState(null);

  // Координаты автосалона
  const location = { lat: 53.9006, lng: 27.5590 }; // Пример для Минска

  // API-ключи
  const WEATHER_API_KEY = '6ade661e6cd3047f64985d231e80726d';
  const RAPIDAPI_KEY = '637e77c33dmsh69352e84f828ae9p1156b3jsna7d3cce1e7de';

  // Функция определения геолокации пользователя
  const getGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoordinates({ lat: latitude, lng: longitude });
          fetchWeather(latitude, longitude); // Загружаем погоду для текущих координат
          // alert(`Ваши координаты: Широта: ${latitude}, Долгота: ${longitude}`);
        },
        (error) => {
          alert(`Ошибка получения местоположения: ${error.message}`);
        }
      );
    } else {
      alert('Геолокация не поддерживается этим браузером.');
    }
  };

  // Получение данных о погоде
  const fetchWeather = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
      );
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error('Ошибка при загрузке погоды:', error);
    }
  };

  // Получение списка автомобилей
  const fetchCars = async () => {
    try {
      const response = await fetch('https://cars-by-api-ninjas.p.rapidapi.com/v1/cars?model=corolla', {
        method: 'GET',
        headers: {
          'X-RapidAPI-Host': 'cars-by-api-ninjas.p.rapidapi.com',
          'X-RapidAPI-Key': RAPIDAPI_KEY,
        },
      });
      const data = await response.json();
      setCars(data);
    } catch (error) {
      console.error('Ошибка при загрузке списка автомобилей:', error);
    } finally {
      setLoadingCars(false);
    }
  };

  // Получение данных пользователя с сервера
  const fetchUserDates = async () => {
    if (!user || !user._id) {
      console.warn('Пользователь не найден');
      return;
    }
  
    try {
      const response = await fetch(`/api/users/${user._id}`);
      if (!response.ok) throw new Error('Ошибка при загрузке данных пользователя');
  
      const data = await response.json();
      if (data.createdAt && data.updatedAt) {
        setUserCreatedAt(data.createdAt);
        setUserUpdatedAt(data.updatedAt);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
    }
  };
  
  useEffect(() => {
    if (user && user._id) {
      fetchUserDates();
    }
  }, [user]);
  

  // Получение текущей даты и времени
  const getCurrentDate = () => {
    const date = new Date();
    setCurrentDate(date);
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchWeather(location.lat, location.lng);
    fetchCars();
    fetchUserDates();
    getCurrentDate();
    getGeolocation(); // Добавлен вызов определения геолокации
  }, []);

  // Преобразование времени в часовой пояс пользователя и UTC
  const formatDate = (date, timezone) => {
    return moment(date).tz(timezone).format('YYYY-MM-DD HH:mm:ss');
  };

  const formatUTC = (date) => {
    return moment(date).utc().format('YYYY-MM-DD HH:mm:ss');
  };

  // Если пользователь не авторизован, показываем сообщение
  if (!isAuthenticated || !user) {
    return (
      <div className="dashboard-page">
        <div className="login-message">Пожалуйста, войдите в аккаунт.</div>
      </div>
    );
  }

  // Вывод информации о пользователе
  return (
    <div className="dashboard-page">
      <h1>Добро пожаловать, {user.username}!</h1>
      <p>Это панель управления, доступная только авторизованным пользователям.</p>

      {/* Текущая дата и время в временной зоне пользователя */}
      {currentDate && (
        <div className="current-date">
          <p>
            Текущая дата (в вашей временной зоне - {userTimezone}): {formatDate(currentDate, userTimezone)}
          </p>
          <p>Текущая дата (в UTC): {formatUTC(currentDate)}</p>
        </div>
      )}

      {/* Карта Google */}
      <div className="map-container">
        <LoadScript googleMapsApiKey="">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={userCoordinates || location} // Если координаты пользователя есть, используем их
            zoom={15}
          >
            <Marker position={userCoordinates || location} /> {/* Маркер для текущего местоположения */}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Погода */}
      <div className="weather">
        {weather ? (
          <div className="weather-info">
            <h2>Погода в вашем регионе:</h2>
            <p>🌡️ Температура: <strong>{weather.main.temp}°C</strong></p>
            <p>☁️ Состояние: <strong>{weather.weather[0].description}</strong></p>
            <p>💧 Влажность: <strong>{weather.main.humidity}%</strong></p>
            <p>🌬️ Скорость ветра: <strong>{weather.wind.speed} м/с</strong></p>
          </div>
        ) : (
          <p>Загрузка данных о погоде...</p>
        )}
      </div>

      {/* Список автомобилей */}
      <div className="cars">
        <h2>Модели автомобилей:</h2>
        {loadingCars ? (
          <p>Загрузка списка автомобилей...</p>
        ) : cars.length > 0 ? (
          <ul className="car-list">
            {cars.map((car, index) => (
              <li key={index} className="car-item">
                <strong>{car.make} {car.model}</strong> ({car.year})
              </li>
            ))}
          </ul>
        ) : (
          <p>Нет доступных данных об автомобилях.</p>
        )}
      </div>

      {/* Даты создания и обновления данных */}
      <div className="data-dates">
        {userCreatedAt && (
          <>
            <p>Дата добавления данных (в вашей временной зоне): {formatDate(userCreatedAt, userTimezone)}</p>
            <p>Дата добавления данных (в UTC): {formatUTC(userCreatedAt)}</p>
          </>
        )}
        {userUpdatedAt && (
          <>
            <p>Дата обновления данных (в вашей временной зоне): {formatDate(userUpdatedAt, userTimezone)}</p>
            <p>Дата обновления данных (в UTC): {formatUTC(userUpdatedAt)}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
