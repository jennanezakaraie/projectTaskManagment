const express = require('express');
const userRouter = express.Router();
userRouter.use(express.json());
const {
  login,
  createUser,
  getOneUser,
  getAllUsers,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword
} = require('../controller/UserController');


userRouter.post('/login', login);
userRouter.post('/create/:userp', createUser);
userRouter.get('/:name', getOneUser);
userRouter.get('/', getAllUsers);
userRouter.put('/:userID', updateUser);
userRouter.delete('/:userID', deleteUser);
userRouter.post('/forgotPassword',forgotPassword);
userRouter.post('/resetPassword',resetPassword)


module.exports = userRouter;