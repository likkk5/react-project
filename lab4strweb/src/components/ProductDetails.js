import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../css/ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams(); // Получаем ID продукта из URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!response.ok) throw new Error('Ошибка при загрузке данных');
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="product-details">
      <h1>{product.name}</h1>
      <img src={product.photo} alt={product.name} className="product-image" />
        <div className="product-info-box">
            <p><strong>Код:</strong> {product.code}</p>
            <p><strong>Тип продукта:</strong> {product.productType}</p>
            <p><strong>Производитель:</strong> {product.manufacturer}</p>
            <p><strong>Характеристики:</strong> {product.characteristics}</p>
            <p><strong>Цена:</strong> ${product.price}</p>
        </div>
    </div>
  );
};

export default ProductDetails;
