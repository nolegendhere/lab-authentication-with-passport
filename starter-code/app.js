/*jshint esversion: 6*/
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();

var index = require('./routes/index');
var users = require('./routes/users');
const passportRouter = require("./routes/passportRouter");
//mongoose configuration
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/passport-local");
//require the user model
const User = require("./models/user");
const session       = require("express-session");
const bcrypt        = require("bcrypt");
const passport      = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const flash = require("connect-flash");





//enable sessions here
app.use(session({
  secret: "our-passport-local-strategy-app",
  resave: true,
  saveUninitialized: true
}));


app.use(flash());

//initialize passport and session here
passport.serializeUser((user, cb) => {
 console.log(user.hasOwnProperty("id"));
 cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
 User.findOne({ "_id": id }, (err, user) => {
   if (err) { return cb(err); }
   cb(null, user);
 });
});

passport.use(new LocalStrategy({
 passReqToCallback: true
}, (req, username, password, next) => {
 User.findOne({ username }, (err, user) => {
   if (err) {
     return next(err);
   }
   if (!user) {
     return next(null, false, { message: "Incorrect username" });
   }
   if (!bcrypt.compareSync(password, user.password)) {
     return next(null, false, { message: "Incorrect password" });
   }

   return next(null, user);
 });
}));



app.use(passport.initialize());
app.use(passport.session());



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// require in the routers
app.use('/', index);
app.use('/', users);
app.use('/', passportRouter);





//passport code here










// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
