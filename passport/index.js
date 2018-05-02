let passport = require('passport');
let LocalStrategy = require('passport-local');
const {loginCheck} = require('../db/models/user');
const errors = require('../errors.list');


let setup = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser(serialize);
  passport.deserializeUser(deserialize);
  passport.use(new LocalStrategy(
    {
      passReqToCallback: true,
    },
    loginCheck
  ));  


};


let serialize = (user, done) => {
  done(null, user);
};
let deserialize = (user, done) => {
  loginCheck(null, user.username, user.password).then(res => {
    return done(null, res);
  }).catch(err => {
    if (err === errors.noUser)
      return done(null, false, {message: 'Incorrect username.'});
    else if (err === errors.badPass)
      return done(null, false, {message: 'Incorrect password.'});
    else
      return done(err);

  })

};

module.exports = {
  setup
};