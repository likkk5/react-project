import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../css/Employees.css'; // Подключаем стили

const Employees = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [localSearch, setLocalSearch] = useState('');
  const [newEmployee, setNewEmployee] = useState({
    user: '',
    position: '',
    phoneNumber: '',
    email: '',
    startDate: '',
    birthDate: '',
    photo: '',
    username: '',
  });
  const [editEmployee, setEditEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, [search, sortBy, order]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, sortBy, order }).toString();
      const response = await fetch(`http://localhost:5000/api/employees?${query}`);
      if (!response.ok) throw new Error('Ошибка при загрузке сотрудников');
      const data = await response.json();
      // Локальная сортировка пользователей
      if (sortBy === 'position') {
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
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!isAuthenticated) return alert('Вы не авторизованы!');
    try {
      const response = await fetch('http://localhost:5000/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      });
      if (!response.ok) throw new Error('Ошибка при добавлении сотрудника');
      setNewEmployee({
        user: '',
        position: '',
        phoneNumber: '',
        email: '',
        startDate: '',
        birthDate: '',
        photo: '',
        username: '',
      });
      fetchEmployees();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!isAuthenticated) return alert('Вы не авторизованы!');
    try {
      const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Ошибка при удалении сотрудника');
      fetchEmployees();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (employee) => {
    if (!isAuthenticated) return alert('Вы не авторизованы!');
    setEditEmployee(employee);
  };

  const handleUpdate = async () => {
    if (!isAuthenticated) return alert('Вы не авторизованы!');
    try {
      const response = await fetch(`http://localhost:5000/api/employees/${editEmployee._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editEmployee),
      });
      if (!response.ok) throw new Error('Ошибка при обновлении данных сотрудника');
      setEditEmployee(null);
      fetchEmployees();
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
    <div className="employees-page">
      <h1>Сотрудники</h1>

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
          <option value="position">Позиция</option>
          <option value="email">Email</option>
        </select>
        <select onChange={(e) => setOrder(e.target.value)} value={order}>
          <option value="asc">По возрастанию</option>
          <option value="desc">По убыванию</option>
        </select>
      </div>

      {/* {isAuthenticated && (
        <div className="add-employee">
          <h2>Добавить сотрудника</h2>
          <input
            type="text"
            placeholder="Позиция"
            value={newEmployee.position}
            onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
          />
          <button onClick={handleCreate}>Добавить</button>
        </div>
      )} */}

      {/* Список сотрудников */}
      <div className="employee-list">
        {employees.map((employee) => (
          <div key={employee._id} className="employee-card">
          <h2>{employee.user?.username || 'Без имени'}</h2>
          <p>Позиция: {employee.position}</p>
          <p>Email: {employee.email}</p>
          <p>Телефон: {employee.phoneNumber}</p>
          <div className="action-buttons">
            <button className="edit" onClick={() => handleEdit(employee)}>
              Редактировать
            </button>
            <button className="delete" onClick={() => handleDelete(employee._id)}>
              Удалить
            </button>
          </div>
        </div>        
        ))}
      </div>
      {isAuthenticated && (
      <div className="employee-form">
        <h2>{editEmployee ? 'Редактировать сотрудника' : 'Добавить сотрудника'}</h2>

        {/* Поле для имени пользователя */}
        <input
          type="text"
          placeholder="Имя сотрудника"
          value={editEmployee ? editEmployee.user.username : newEmployee.user.username}
          onChange={(e) =>
            editEmployee
              ? setEditEmployee({ ...editEmployee, user: { ...editEmployee.user, username: e.target.value } })
              : setNewEmployee({ ...newEmployee, user: { ...newEmployee.user, username: e.target.value } })
          }
        />

        {/* Поле для позиции */}
        <input
          type="text"
          placeholder="Позиция"
          value={editEmployee ? editEmployee.position : newEmployee.position}
          onChange={(e) =>
            editEmployee
              ? setEditEmployee({ ...editEmployee, position: e.target.value })
              : setNewEmployee({ ...newEmployee, position: e.target.value })
          }
        />

        {/* Поле для телефона */}
        <input
          type="text"
          placeholder="Телефон"
          value={editEmployee ? editEmployee.phoneNumber : newEmployee.phoneNumber}
          onChange={(e) =>
            editEmployee
              ? setEditEmployee({ ...editEmployee, phoneNumber: e.target.value })
              : setNewEmployee({ ...newEmployee, phoneNumber: e.target.value })
          }
        />

        {/* Поле для email */}
        <input
          type="email"
          placeholder="Email"
          value={editEmployee ? editEmployee.email : newEmployee.email}
          onChange={(e) =>
            editEmployee
              ? setEditEmployee({ ...editEmployee, email: e.target.value })
              : setNewEmployee({ ...newEmployee, email: e.target.value })
          }
        />

        {/* Кнопка для добавления/обновления сотрудника */}
        <button onClick={editEmployee ? handleUpdate : handleCreate}>
          {editEmployee ? 'Обновить' : 'Добавить'}
        </button>

        {/* Кнопка отмены редактирования */}
        {editEmployee && <button onClick={() => setEditEmployee(null)}>Отмена</button>}
      </div>
    )}
    </div>
  );
};

export default Employees;
