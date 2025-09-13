import '../css/Orders.css';
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Orders = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]); // Состояние для продуктов
  const [users, setUsers] = useState([]); // Состояние для пользователей
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [localSearch, setLocalSearch] = useState('');
  const [newOrder, setNewOrder] = useState({
    buyer: '',
    product: '',
    quantity: 1,
    promoCode: '',
  });
  const [editOrder, setEditOrder] = useState(null); // Состояние для редактируемого заказа

  useEffect(() => {
    fetchOrders();
    fetchProducts(); // Загружаем продукты при загрузке страницы
    fetchUsers();
  }, [search, sortBy, order]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, sortBy, order }).toString();
      const response = await fetch(`http://localhost:5000/api/orders?${query}`);
      if (!response.ok) throw new Error('Ошибка при загрузке заказов');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (!response.ok) throw new Error('Ошибка при загрузке продуктов');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      if (!response.ok) throw new Error('Ошибка при загрузке пользователей');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      if (!response.ok) throw new Error('Ошибка при добавлении заказа');
      setNewOrder({ buyer: '', product: '', quantity: 1, promoCode: '' });
      fetchOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Ошибка при удалении заказа');
      fetchOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (order) => {
    setEditOrder(order); // Сохраняем выбранный заказ в состояние для редактирования
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${editOrder._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editOrder),
      });
      if (!response.ok) throw new Error('Ошибка при обновлении заказа');
      setEditOrder(null); // После обновления, сбрасываем состояние редактирования
      fetchOrders(); // Обновляем список заказов
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
    <div className="orders-page">
      <h1>Заказы</h1>
  
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
        <select onChange={(e) => setSortBy(e.target.value)}>
          <option value="">Сортировка</option>
          <option value="buyer.username">Покупатель</option>
          <option value="product.name">Продукт</option>
        </select>
        <select onChange={(e) => setOrder(e.target.value)}>
          <option value="asc">По возрастанию</option>
          <option value="desc">По убыванию</option>
        </select>
      </div>
  
      {/* Список заказов */}
      <div className="order-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <h2>Заказ #{order._id}</h2>
            <p>Покупатель: {order.buyer.username}</p>
            <p>Продукт: {order.product.name}</p>
              <div className="action-buttons">
                <button className="edit" onClick={() => handleEdit(order)}>
                  Редактировать
                </button>
                <button className="delete" onClick={() => handleDelete(order._id)}>
                  Удалить
                </button>
              </div>
          </div>
        ))}
      </div>
      {/* Форма добавления или редактирования заказа */}
    {isAuthenticated && (
      <div className="order-form">
        <h2>{editOrder ? 'Редактировать заказ' : 'Добавить заказ'}</h2>

        {/* Поле для покупателя */}
        {/* <input
          type="text"
          placeholder="Покупатель"
          value={editOrder ? editOrder.buyer : newOrder.buyer}
          onChange={(e) =>
            editOrder
              ? setEditOrder({ ...editOrder, buyer: e.target.value })
              : setNewOrder({ ...newOrder, buyer: e.target.value })
          }
        /> */}
        <select
          value={editOrder?.buyer || newOrder.buyer || ""}
          onChange={(e) =>
            editOrder
              ? setEditOrder({ ...editOrder, buyer: e.target.value })
              : setNewOrder({ ...newOrder, buyer: e.target.value })
          }
        >
          <option value="" disabled>
            Выберите покупателя
          </option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.username}
            </option>
          ))}
        </select>

        {/* Поле для выбора продукта */}
        <select
          value={editOrder?.product || newOrder.product || ""}
          onChange={(e) =>
            editOrder
              ? setEditOrder({ ...editOrder, product: e.target.value })
              : setNewOrder({ ...newOrder, product: e.target.value })
          }
        >
          <option value="" disabled>
            Выберите продукт
          </option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name}
            </option>
          ))}
        </select>
        {/* <input
            type="text"
            placeholder="Продукт"
            value={editOrder.product}
            onChange={(e) =>
              editOrder
                ? setEditOrder({ ...editOrder, product: e.target.value })
                : setNewOrder({ ...newOrder, product: e.target.value })
            }
          /> */}

        {/* Поле для количества */}
        <input
          type="number"
          placeholder="Количество"
          value={editOrder ? editOrder.quantity : newOrder.quantity}
          min="1"
          step="1"
          onChange={(e) => {
            const value = Math.max(1, e.target.value);
            editOrder
              ? setEditOrder({ ...editOrder, quantity: value })
              : setNewOrder({ ...newOrder, quantity: value });
          }}
        />

        {/* Кнопка для добавления или обновления заказа */}
        <button onClick={editOrder ? handleUpdate : handleCreate}>
          {editOrder ? 'Обновить' : 'Добавить'}
        </button>

        {/* Кнопка отмены редактирования заказа */}
        {editOrder && <button onClick={() => setEditOrder(null)}>Отмена</button>}
      </div>
    )}
    </div>
  );  
};

export default Orders;
