const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Локальная стратегия
passport.use(new LocalStrategy(
  { usernameField: 'email' }, // Указываем, что используется email вместо username
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email }); // Ищем пользователя по email
      if (!user) return done(null, false, { message: 'Неверный email.' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: 'Неверный пароль.' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Google стратегия
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        user = new User({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails?.[0]?.value || '',
        });

        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));


// Facebook стратегия
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ facebookId: profile.id });

    if (!user) {
      user = await User.create({
        facebookId: profile.id,
        username: profile.displayName,
        email: profile.emails ? profile.emails[0].value : null
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Сериализация пользователя
passport.serializeUser((user, done) => done(null, user.id));

// Десериализация пользователя
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Обновлено на использование async/await
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
