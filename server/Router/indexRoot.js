
const express = require("express");

const userRouter = require("./userRoute");
const taskRouter = require("./taskRoute")

const authenticateToken= require("../auth")



const Router  = express.Router();
const cors = require('cors');
Router.use(cors());

Router.use("/user",userRouter);
Router.use(authenticateToken);


  

Router.use("/task",taskRouter);
module.exports  = Router
