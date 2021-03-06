if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

const cloudinary = require('cloudinary').v2
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const User = require('./models/user')
const bcrypt = require('bcryptjs')
const { localStrategy, serializeUser, deserializeUser } = require('./utils/passport')

/*const cl = new Cloudinary({cloud_name: process.env.CLOUD_NAME, secure: true});*/
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
app.use(express.json())
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});
app.use(express.urlencoded({ extended: false }));


const indexRouter = require('./routes/index')
const plantRouter = require('./routes/plants')
const userRouter = require('./routes/users')


const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))


app.use('/', indexRouter)
app.use('/plants', plantRouter)
app.use('/users', userRouter)


app.listen(process.env.PORT || 8000)

