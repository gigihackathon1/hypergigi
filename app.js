const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors'); // Import CORS module
const { User } = require('./models'); // Adjust the paths as needed
const passportConfig = require('./config/passport'); // Import your Passport configuration
const jwt = require('jsonwebtoken'); // Import JWT module
const usersRouter = require('./routes/users');
const { jwtSecret } = require('./config/auth'); // Import your JWT secret

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

app.use(
  session({
    secret: 'YOUR_SESSION_SECRET', // Replace with your actual session secret
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize passport and session
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
    console.log(user,"user");

    const generateAccessToken = (user) => {
      return jwt.sign({ id: user.id, email: user.email }, 'your-secret-key', {
        expiresIn: '1h', // Token will expire in 1 hour
      });
    };
    
    const generateRefreshToken = (user) => {
      return jwt.sign({ id: user.id, email: user.email }, 'your-refresh-secret-key', {
        expiresIn: '7d', // Refresh token will expire in 7 days
      });
    };

    // Calculate expiration time
    const expiresIn = new Date().getTime() + 15 * 60 * 1000; // 15 minutes from now

    res.json({
      status: true,
      accessToken: generateAccessToken(user),
      refreshToken: generateRefreshToken(user),
      expiresIn: expiresIn,
    });
  }
);

// Mount the users router
app.use('/v1', usersRouter);

// Handle 404 and error routes
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
