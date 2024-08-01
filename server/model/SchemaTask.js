const mongoose = require('mongoose');


const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },

  dueDate: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  file:{
    filename: String,
    path: String,
    originalname: String,
 },

},

{ timestamps : true}
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
