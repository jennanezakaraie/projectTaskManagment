const Router  =  require("./Router/indexRoot");
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');

const {DBUSER,DBPASSWORD,DBNAME} = process.env;

app.use(express.json());
app.use(cors());
app.use(Router);
app.use(bodyParser.json());
const corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next() });

// Ensure to replace <username>, <password>, and <dbname> with your actual MongoDB Atlas credentials
mongoose.connect(`mongodb+srv://${DBUSER}:${DBPASSWORD}@cluster1.skrmyau.mongodb.net/${DBNAME}`).then(() => {
}).catch((err) => {
    console.error('Error connecting to MongoDB Atlas', err);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
