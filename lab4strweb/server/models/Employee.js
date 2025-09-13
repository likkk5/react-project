const mongoose = require('mongoose');
const employeeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    position: { type: String, required: true },
    phoneNumber: { type: String, default: '+375-25-123-45-67' },
    email: { type: String, required: true },
    startDate: { type: Date, default: Date.now },
    birthDate: { type: Date, default: new Date('2000-01-01') },
    photo: { type: String, default: 'contact_photos/default_photo.png' },
  });
  
module.exports = mongoose.model('Employee', employeeSchema);