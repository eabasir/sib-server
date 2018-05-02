const express = require('express');
const router = express.Router();
const {User, USER_LEVEL, loginCheck} = require('../../db/models/user');
const config = require('../../config');
const passport = require('passport');
const errors = require('../../errors.list');

/* Add new user by admin */
router.post('/', function (req, res, next) {

  try {

    if (req.user.userType !== USER_LEVEL.ADMIN) {
      sendError(res, errors.adminOnly);
      return;
    }
    let user = new User({
      username: req.body.username,
      password: req.body.password,
      surname: req.body.displayName,
      userType: req.body.userType
    });

    user.save().then(doc => {
      res.json(doc._id);

    }).catch(err => {
      sendError(res, err);

    });
  } catch (err) {
    sendError(res, err);

  }
});

router.get('/validate', isAuthenticated, function (req, res, next) {

  User.find({username: req.user.username}).then(user => {

    let result = user[0].toObject();
    if (!result) {
      sendError(res, config.UNAUTHENTICATED_REQUEST, 'Incorrect username.');
    }
    if (result.password !== req.user.password) {
      sendError(res, config.UNAUTHENTICATED_REQUEST, 'Incorrect password.');
    }
    res.json({
      user: req.user.username
    });


  }).catch(err => {
    sendError(res, err, null);
  });


});

router.post('/login', passport.authenticate('local', {}), function (req, res, next) {
  req.session.save();
  res.json({
    username: req.user.username,
    userType: req.user.userType,
    displayName: req.user.displayName
  });

});

router.get('/logout', (req, res) => {
  req.logout();
  res.sendStatus(200)
});

function isAuthenticated(req, res, next) {

  // do any checks you want to in here

  // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
  // you can do this however you want with whatever variables you set up
  if (req.user && req.user.username)
    return next();

  // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE

  sendError(res, errors.unAuthenticateUser);

}

function sendError(res, err) {

  res.status(err.status || 500)
    .send(err.message || err);

}

module.exports = {
  loginCheck,
  router
};
