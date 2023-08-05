const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { googleAuth, jwtSecret } = require('./auth');
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

passport.use(
  new GoogleStrategy(
    googleAuth,
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ where: { googleId: profile.id } });

        if (!user) {
          user = await User.findOne({ where: { email: profile.email } });

          if (!user) {
            // Generate a random password for Google-authenticated users
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);

            user = await User.create({
              uuid: profile.id, // Use profile.id as UUID for Google-authenticated users
              username: profile.given_name,
              email: profile.email,
              password: hashedPassword,
              googleId: profile.id,
              googleLocation: profile.location // Assuming 'location' is available in the profile
              // You can add more fields here as needed
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
  // Fetch user data by id and call done(null, user)
  User.findByPk(id)
    .then(user => {
      done(null, user);
    })
    .catch(err => {
      done(err, null);
    });
});

module.exports = passport;
