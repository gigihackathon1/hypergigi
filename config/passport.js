const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const { googleAuth, jwtSecret } = require('./auth');
const { User } = require('../models');

const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
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
            const hashedPassword = await bcrypt.hash("password", saltRounds);

            user = await User.create({
              uuid: uuidv4(),
              username: profile.given_name,
              email: profile.email,
              password: hashedPassword,
              googleId: profile.id,
              googleLocation: profile._json.location // Access location from _json object
              // You can add more fields here as needed
            });

            return done(null, user);
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
  // Store the user ID in the session
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // Retrieve the user from the database based on the stored ID
    const user = await User.findByPk(id); // Use the provided ID directly
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
