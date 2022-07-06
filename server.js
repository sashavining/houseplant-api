if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

const cloudinary = require('cloudinary').v2
const express = require('express')
const path = require("path");
const app = express()
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
/*const cl = new Cloudinary({cloud_name: process.env.CLOUD_NAME, secure: true});*/

const indexRouter = require('./routes/index')
const plantRouter = require('./routes/plants')
const User = require('./models/user')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { 
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Authentication Failed" });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // passwords match! log user in
          return done(null, user)
        } else {
          // passwords do not match!
          return done(null, false, { message: "Authentication Failed" })
        }
      })      
      return done(null, user);
    });
  })
);
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});


const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))


app.use('/', indexRouter)
app.use('/plants', plantRouter)

app.listen(process.env.PORT || 8000)