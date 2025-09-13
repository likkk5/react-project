import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ProductFilter from './ProductFilter';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import '../css/Products.css';

const Products = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [newProduct, setNewProduct] = useState({
    code: '',
    name: '',
    price: '',
    characteristics: '',
    manufacturer: '',
    productType: '',
    photo: '',
  });
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [search, sortBy, order]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, sortBy, order }).toString();
      const response = await fetch(`http://localhost:5000/api/products?${query}`, {
        credentials: 'include', // Для работы с cookies сессии
      });
      if (!response.ok) throw new Error('Ошибка при загрузке данных');
      const data = await response.json();
      if (sortBy === 'name') {
        data.sort((a, b) =>
          order === 'asc'
            ? a.name.localeCompare(b.name) // A-Z
            : b.name.localeCompare(a.name) // Z-A
        );
      } else if (sortBy === 'price') {
        data.sort((a, b) => (order === 'asc' ? a.price - b.price : b.price - a.price));
      }
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const [isRequestInProgress, setIsRequestInProgress] = useState(false); // Флаг запроса

  const handleCreate = async () => {
    if (!isAuthenticated) {
      alert('Вы не авторизованы!');
      return;
    }
  
    // Если запрос уже в процессе, не отправляем новый
    if (isRequestInProgress) return;
  
    setIsRequestInProgress(true); // Устанавливаем флаг в true, чтобы предотвратить повторный запрос
  
    try {
      // Создаем FormData, чтобы отправить данные и файл
      const formData = new FormData();
      formData.append('code', newProduct.code);
      formData.append('name', newProduct.name);
      formData.append('price', newProduct.price);
      formData.append('characteristics', newProduct.characteristics);
      formData.append('manufacturer', newProduct.manufacturer);
      formData.append('productType', newProduct.productType);
      if (newProduct.photo) {
        formData.append('photo', newProduct.photo); // Добавляем файл только если он выбран
      }
  
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        body: formData, // Отправляем FormData
        credentials: 'include',
      });
  
      if (!response.ok) {
        const data = await response.json();
        console.log('Ответ от сервера:', data); // Логируем ответ сервера
        if (data.details) {
          alert(`Ошибки валидации: ${data.details.join(', ')}`);
        } else {
          throw new Error('Ошибка при добавлении продукта');
        }
      }
  
      // Если всё прошло успешно, сбрасываем форму
      setNewProduct({
        code: '',
        name: '',
        price: '',
        characteristics: '',
        manufacturer: '',
        productType: '',
        photo: null, // Сбрасываем фото
      });
  
      // Обновляем список продуктов после успешного добавления
      await fetchProducts();
    } catch (err) {
      console.error('Ошибка при добавлении продукта:', err.message);
      alert('Произошла ошибка при добавлении продукта. Попробуйте позже.');
    } finally {
      setIsRequestInProgress(false);
    }
  };  

  const handleUpdate = async () => {
    try {
      // Создаем FormData
      const formData = new FormData();
      formData.append('code', editProduct.code);
      formData.append('name', editProduct.name);
      formData.append('price', editProduct.price);
      formData.append('characteristics', editProduct.characteristics);
      formData.append('manufacturer', editProduct.manufacturer);
      formData.append('productType', editProduct.productType);
      if (editProduct.photo) {
        formData.append('photo', editProduct.photo);
      }
  
      const response = await fetch(`http://localhost:5000/api/products/${editProduct._id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      });
  
      if (!response.ok) throw new Error('Ошибка при обновлении продукта');
      setEditProduct(null);
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };  
  const handleDelete = async (id) => {
    if (!isAuthenticated) return alert('Вы не авторизованы!');
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Ошибка при удалении продукта');
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (product) => {
    if (!isAuthenticated) return alert('Вы не авторизованы!');
    setEditProduct(product);
  };
    // Обработчик очистки поиска
    const handleClearSearch = () => {
      setSearch('');
      fetchProducts(); // Восстанавливаем весь список продуктов
    };
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="product-page">
      <h1>Продукты</h1>
      <ProductFilter search={search} setSearch={setSearch} sortBy={sortBy} setSortBy={setSortBy} order={order} setOrder={setOrder} onClearSearch={handleClearSearch} />
      {isAuthenticated && (
        <ProductForm
          productData={editProduct || newProduct}
          setProductData={editProduct ? setEditProduct : setNewProduct}
          isEditMode={!!editProduct}
          handleCreate={handleCreate}
          handleUpdate={handleUpdate}
        />
      )}
      {products.length === 0 ? (
    <p>Продукты не найдены по запросу: "{search}"</p> // Сообщение, если нет продуктов
    ) : (
      <ProductList products={products} handleEdit={setEditProduct} handleDelete={handleDelete} isAuthenticated={isAuthenticated} />
    )}
    </div>
  );
};

export default Products;
