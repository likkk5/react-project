import '../css/Users.css';
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Импортируем контекст

const Users = () => {
  const { isAuthenticated } = useContext(AuthContext); // Контекст аутентификации
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [localSearch, setLocalSearch] = useState(''); 
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    isCustomer: false,
    isEmployee: false,
    isAdmin: false,
  });
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [search, sortBy, order]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, sortBy, order }).toString();
      const response = await fetch(`http://localhost:5000/api/users?${query}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Ошибка при загрузке пользователей');
      const data = await response.json();
      // Локальная сортировка пользователей
      if (sortBy === 'username') {
        data.sort((a, b) =>
          order === 'asc'
            ? a.username.localeCompare(b.username) // A-Z
            : b.username.localeCompare(a.username) // Z-A
        );
      } else if (sortBy === 'email') {
        data.sort((a, b) =>
          order === 'asc'
            ? a.email.localeCompare(b.email) // A-Z
            : b.email.localeCompare(a.email) // Z-A
        );
      }
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!isAuthenticated) return alert('Вы не авторизованы!');
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Ошибка при добавлении пользователя');
      setNewUser({ username: '', email: '', password: '', isCustomer: true, isEmployee: false, isAdmin: false });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!isAuthenticated) return alert('Вы не авторизованы!');
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Ошибка при удалении пользователя');
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (user) => {
    if (!isAuthenticated) return alert('Вы не авторизованы!');
    setEditUser(user);
  };

  const handleUpdate = async () => {
    if (!isAuthenticated) return alert('Вы не авторизованы!');
    try {
      const response = await fetch(`http://localhost:5000/api/users/${editUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUser),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Ошибка при обновлении пользователя');
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };
  // Функция для очистки поиска
  const handleClearSearch = () => {
    setLocalSearch('');
    setSearch('');
  };

  // Функция для отправки поискового запроса
  const handleSearchClick = () => {
    setSearch(localSearch); // Обновляем глобальное состояние поиска
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="users-page">
      <h1>Пользователи</h1>

      {/* Поиск и сортировка */}
      <div className="search-sort-controls">
        <input
          type="text"
          placeholder="Поиск по имени"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)} // Локально обновляем ввод
        />
        <button onClick={handleSearchClick}>Искать</button>
        <button onClick={handleClearSearch}>Очистить поиск</button>
        <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
          <option value="">Сортировка</option>
          <option value="username">По имени</option>
          <option value="email">По email</option>
        </select>
        <select onChange={(e) => setOrder(e.target.value)} value={order}>
          <option value="asc">По возрастанию</option>
          <option value="desc">По убыванию</option>
        </select>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}

      {/* Список пользователей */}
      <div className="user-list">
        {users.map((user) => (
          <div key={user._id} className="user-card">
            <h2>{user.username}</h2>
            <p>Email: {user.email}</p>
            <button onClick={() => handleEdit(user)}>Редактировать</button>
            <button onClick={() => handleDelete(user._id)}>Удалить</button>
          </div>
        ))}
      </div>

      {/* Добавление пользователя */}
      {isAuthenticated && (
        <div className="user-form">
        <h2>{editUser ? 'Редактировать пользователя' : 'Добавить пользователя'}</h2>

        {/* Поле для имени пользователя */}
        <input
          type="text"
          placeholder="Имя пользователя"
          value={editUser ? editUser.user : newUser.user}
          onChange={(e) =>
            editUser
              ? setEditUser({ ...editUser, username: e.target.value })
              : setNewUser({ ...newUser, username: e.target.value })
          }
        />

        {/* Поле для email */}
        <input
          type="email"
          placeholder="Email"
          value={editUser ? editUser.email : newUser.email}
          onChange={(e) =>
            editUser
              ? setEditUser({ ...editUser, email: e.target.value })
              : setNewUser({ ...newUser, email: e.target.value })
          }
        />

        {/* Поле для пароля */}
        <input
          type="password"
          placeholder="Пароль"
          value={editUser ? editUser.password : newUser.password}
          onChange={(e) =>
            editUser
              ? setEditUser({ ...editUser, password: e.target.value })
              : setNewUser({ ...newUser, password: e.target.value })
          }
        />

        {/* Кнопка для добавления/обновления пользователя */}
        <button onClick={editUser ? handleUpdate : handleCreate}>
          {editUser ? 'Обновить' : 'Добавить'}
        </button>

        {editUser && <button onClick={() => setEditUser(null)}>Отмена</button>}
      </div>
      )}
    </div>
  );
};

export default Users;
