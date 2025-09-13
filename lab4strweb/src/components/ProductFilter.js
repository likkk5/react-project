import React, { useState } from 'react';
//Декларативная функция
function ProductFilter({
  search = '',        // Значение по умолчанию для поиска
  setSearch = () => {}, // Значение по умолчанию для функций
  sortBy = '',
  setSortBy = () => {},
  order = 'asc',
  setOrder = () => {},
  onClearSearch = () => {},
}) {
  const [localSearch, setLocalSearch] = useState(search);

  const handleClearSearch = () => {
    setLocalSearch('');
    onClearSearch(''); // Очистить и отправить пустую строку на сервер
  };

  const handleSearchClick = () => {
    setSearch(localSearch); // Обновить глобальное состояние
  };

  const handleInputFocus = () => {
    console.log('Поисковая строка в фокусе!');
  };

  return (
    <div className="filter-bar">
      <input
        type="text"
        placeholder="Поиск"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)} // Локально обновляем ввод
        onFocus={handleInputFocus}
      />
      <button onClick={handleSearchClick}>Искать</button>
      <button onClick={handleClearSearch}>Очистить поиск</button>
      <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
        <option value="">Сортировка</option>
        <option value="name">По имени</option>
        <option value="price">По цене</option>
      </select>
      <select onChange={(e) => setOrder(e.target.value)} value={order}>
        <option value="asc">По возрастанию</option>
        <option value="desc">По убыванию</option>
      </select>
    </div>
  );
}

// Устанавливаем значения по умолчанию
// ProductFilter.defaultProps = {
//   search: '',
//   setSearch: () => {},
//   sortBy: '',
//   setSortBy: () => {},
//   order: 'asc',
//   setOrder: () => {},
//   onSearch: () => {},
// };

export default ProductFilter;
