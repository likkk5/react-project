const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 },
    dateSold: { type: Date, default: Date.now },
    price: { type: Number, required: false }, // Цена с учетом скидки
    promoCode: { type: String, required: false },
  });
    
module.exports = mongoose.model('Order', orderSchema);
