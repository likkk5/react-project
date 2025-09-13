const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  googleId: { type: String },
  facebookId: { type: String },
  isCustomer: { type: Boolean, default: false },
  isEmployee: { type: Boolean, default: false },
  address: { type: String },
  phoneNumber: { type: String, default: '+375-25-123-45-67' },
  birthDate: { type: Date, default: new Date('2000-01-01') },
  city: { type: String, default: 'Unknown' },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
}, { timestamps: true }); // Добавляем временные метки (createdAt, updatedAt)

// // Хук для хеширования пароля перед сохранением
// userSchema.pre('save', async function(next) {
//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

// // Метод для проверки пароля
// userSchema.methods.isValidPassword = async function(password) {
//   return bcrypt.compare(password, this.password);
// };

module.exports = mongoose.model('User', userSchema);
