const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const {requireAuth, checkUser, adminAuth} = require('./middleware/authMiddleware');

const app = express();

// middleware
app.use(express.static('public'));
app.use(express.static('images'));

app.use(cookieParser());
app.use(bodyParser({limit: '50mb'}));
// view engine
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

 
// database connection 
const dbURI = '';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => {app.listen(3000); console.log("connected to mongo")})
  .catch((err) => console.log(err));
// app.listen(3000);
console.log("server listenning");

// // routes
var __dirname = "./views";
app.get('*', checkUser);
app.get('/', (req, res) => res.render('home'));
app.use(authRoutes);
app.use(companyRoutes);

 