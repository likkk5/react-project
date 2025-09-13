import React from 'react';
// Стрелочная функция
const ProductList = ({ 
  products = [], 
  handleEdit = () => {}, 
  handleDelete = () => {}, 
  isAuthenticated = false 
}) => {
    const handleMouseEnter = (productName) => {
      console.log(`Наведение на продукт: ${productName}`);
    };
  
    const handleRightClick = (e, productId) => {
      e.preventDefault();
      alert(`Контекстное меню для продукта с ID: ${productId}`);
    };
  return (
    <div className="product-list">
    {products.length > 0 ? (
        products.map((product) => (
        <div key={product._id} className="product-card" onMouseEnter={() => handleMouseEnter(product.name)} onContextMenu={(e) => handleRightClick(e, product._id)}>
          <h2>{product.name}</h2>
          <p>{product.productType}</p>
          <p>{product.manufacturer}</p>
          <p>{product.characteristics}</p>
          {product.photo && (
              <img 
                src={`/media/${product.photo}`} 
                alt={product.name} 
                className="product-image" 
                style={{ width: '200px', height: 'auto' }}
              />
            )}
          <p>Цена: ${product.price}</p>
          {isAuthenticated && (
            <>
              <button onClick={() => handleEdit(product)} className="edit-button">
                Редактировать
              </button>
              <button onClick={() => handleDelete(product._id)} className="delete-button">
                Удалить
              </button>
            </>
          )}
          <button
              onClick={() => (window.location.href = `/products/${product._id}`)}
              className="details-button"
            >
              Детали
            </button>
          </div>
        ))
      ) : (
        <p>Нет продуктов для отображения</p>
      )}
    </div>
  );
};
// Устанавливаем значения по умолчанию
// ProductList.defaultProps = {
//     products: [],
//     handleEdit: () => {},
//     handleDelete: () => {},
//     isAuthenticated: false,
//   };
export default ProductList;
