const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['admin', 'user'],
  },
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
