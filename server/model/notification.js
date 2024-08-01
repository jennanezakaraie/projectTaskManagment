const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    date: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  });
  
  const Notification = mongoose.model('Notification', notificationSchema);
  module.exports = Notification;