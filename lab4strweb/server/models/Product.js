const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0.01 },
    characteristics: { type: String },
    manufacturer: { type: String, required: true },
    productType: { type: String, required: true },
    photo: { type: String, default: 'product_photos/default_photo.png' },
  });
  
module.exports = mongoose.model('Product', productSchema);