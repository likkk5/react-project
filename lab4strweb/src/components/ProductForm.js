import React, { Component } from 'react';

class ProductForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code: props.productData.code || '',
      name: props.productData.name || '',
      price: props.productData.price || '',
      characteristics: props.productData.characteristics || '',
      manufacturer: props.productData.manufacturer || '',
      productType: props.productData.productType || '',
      photo: null,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.productData !== this.props.productData) {
      const { productData } = this.props;
      this.setState({
        code: productData.code || '',
        name: productData.name || '',
        price: productData.price || '',
        characteristics: productData.characteristics || '',
        manufacturer: productData.manufacturer || '',
        productType: productData.productType || '',
        photo: null,
      });
    }
  }

  handleInputChange = (e) => {
    const { name, value, files } = e.target;
    this.setState({ [name]: files ? files[0] : value });

    // Обновляем данные в родительском компоненте через пропс setProductData
    this.props.setProductData((prevState) => ({
      ...prevState,
      [name]: files ? files[0] : value,
    }));
  };

  validateForm = () => {
    const { code, name, price } = this.state;
    let errors = {};

    if (!code) errors.code = 'Код продукта обязателен';
    if (!name) errors.name = 'Название продукта обязательно';
    if (!price || isNaN(price) || Number(price) <= 0) errors.price = 'Цена должна быть положительным числом';

    return errors;
  };

  handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value) {
      alert(`Поле ${name} не должно быть пустым!`);
    }
  };

  handleDoubleClick = () => {
    alert('Кнопка была нажата дважды!');
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const errors = this.validateForm();
    if (Object.keys(errors).length > 0) {
      alert(Object.values(errors).join(', '));
      return;
    }

    const { isEditMode, handleCreate, handleUpdate } = this.props;
    const { code, name, price, characteristics, manufacturer, productType, photo } = this.state;

    // Создаем FormData для отправки файла
    const formData = new FormData();
    formData.append('code', code);
    formData.append('name', name);
    formData.append('price', price);
    formData.append('characteristics', characteristics);
    formData.append('manufacturer', manufacturer);
    formData.append('productType', productType);
    if (photo) formData.append('photo', photo);

    if (isEditMode) {
      handleUpdate(formData);
    } else {
      handleCreate(formData);
    }
  };

  render() {
    const { isEditMode } = this.props;
    const { code, name, price, characteristics, manufacturer, productType } = this.state;

    return (
      <div className="add-product-form">
        <h2>{isEditMode ? 'Редактировать продукт' : 'Добавить продукт'}</h2>
        <form onSubmit={this.handleSubmit} encType="multipart/form-data">
          <input
            type="text"
            placeholder="Код"
            name="code"
            value={code}
            onChange={this.handleInputChange}
            onBlur={this.handleBlur}
          />
          <input
            type="text"
            placeholder="Название"
            name="name"
            value={name}
            onChange={this.handleInputChange}
          />
          <input
            type="number"
            placeholder="Цена"
            name="price"
            value={price}
            onChange={this.handleInputChange}
          />
          <input
            type="text"
            placeholder="Характеристики"
            name="characteristics"
            value={characteristics}
            onChange={this.handleInputChange}
          />
          <input
            type="text"
            placeholder="Производитель"
            name="manufacturer"
            value={manufacturer}
            onChange={this.handleInputChange}
          />
          <input
            type="text"
            placeholder="Тип продукта"
            name="productType"
            value={productType}
            onChange={this.handleInputChange}
          />
          <input
            type="file" // Добавлено поле для загрузки файла
            name="photo"
            onChange={this.handleInputChange}
          />
          <button type="submit" onDoubleClick={this.handleDoubleClick}>
            {isEditMode ? 'Обновить' : 'Добавить'}
          </button>
        </form>
      </div>
    );
  }
}

// Устанавливаем значения по умолчанию
ProductForm.defaultProps = {
  productData: {
    code: '',
    name: '',
    price: '',
    characteristics: '',
    manufacturer: '',
    productType: '',
    photo: null,
  },
  isEditMode: false,
  setProductData: () => {},
  handleCreate: () => {},
  handleUpdate: () => {},
};

export default ProductForm;
