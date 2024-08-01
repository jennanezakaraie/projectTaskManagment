const mongoose =require('mongoose');
var bcrypt = require('bcrypt');
const saltRounds = 10;
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'user'],
    default:'user',
  }, 




},

{timestamp:true});

userSchema.pre('save', async function(next) {
  if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  if (this.isNew) {
    if (this.roleName === 'admin') {
      this.role = ADMIN_ROLE_ID;
    } else if (this.roleName === 'user') {
      this.role = USER_ROLE_ID;
    }
  }
  next();
});

const User = mongoose.model('Users', userSchema);

module.exports = User;

