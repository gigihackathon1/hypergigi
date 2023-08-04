const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors'); // Import CORS module
const { User, Vendor } = require('./models'); // Adjust the paths as needed
const passportConfig = require('./config/passport'); // Import your Passport configuration
const jwt = require('jsonwebtoken'); // Import JWT module
const { jwtSecret } = require('./config/auth'); // Import your JWT secret

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Enable CORS for all routes
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(
  session({
    secret: 'YOUR_SESSION_SECRET', // Replace with your actual session secret
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth2 authentication route
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth2 callback route
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Assuming the user is available in the request user object
    const user = req.user;

    // Generate JWT token
    const accessToken = jwt.sign({ userId: user.id }, jwtSecret, {
      expiresIn: '15m',
    });

    // Generate Refresh token
    const refreshToken = jwt.sign({ userId: user.id }, jwtSecret, {
      expiresIn: '7d',
    });

    // Calculate expiration time
    const expiresIn = new Date().getTime() + 15 * 60 * 1000; // 15 minutes from now

    res.json({
      status: true,
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresIn: expiresIn,
    });
  }
);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
