const express = require('express');
const mongoose = require("mongoose");
const User = require("./user");
require('dotenv').config();
const {DBUSER,DBPASSWORD} = process.env;


// Ensure to replace <username>, <password>, and <dbname> with your actual MongoDB Atlas credentials
mongoose.connect(`mongodb+srv://${DBUSER}:${DBPASSWORD}@cluster1.skrmyau.mongodb.net/${DBNAME}`).then(() => {
}).catch((err) => {
    console.error('Error connecting to MongoDB Atlas', err);
});

