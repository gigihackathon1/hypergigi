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
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/signin' }),
  async (req, res) => {
    try {
      if (!req.user) {
        throw new Error('User not available after authentication');
      }

      // Extract the user's email from the req.user object
      const userEmail = req.user.email; // Update this to the correct field name

      // Fetch user data based on the email
      const user = await User.findOne({ where: { email: userEmail } });

      if (!user) {
        // If user is not found, log the userEmail for debugging
        console.log('User not found for email:', userEmail);
        throw new Error('User not found');
      }

      // Redirect the user to the success URL after successful authentication
      const successRedirectUrl = 'http://www.google.com'; // Replace with your desired success URL
      res.redirect(successRedirectUrl);
    } catch (error) {
      console.error('Error in callback route:', error);

      // Redirect the user to the failure URL if authentication fails
      const failureRedirectUrl = '/login'; // Replace with your desired failure URL
      res.redirect(failureRedirectUrl);
    }
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
