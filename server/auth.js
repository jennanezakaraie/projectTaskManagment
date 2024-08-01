const asyncHandle = require("express-async-handler");
const jwtSecret ="39f5e1dd61fe8294de674da4f4143e030bba4edb4c58d1e4306bfce0e33a09c0";
const jwt = require('jsonwebtoken');
const  authenticateToken   =   asyncHandle(async(req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.sendStatus(401); 
    }
  
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403); 
      }
      req.user = user; 
      next(); 
    });
  });

  module.exports = authenticateToken;