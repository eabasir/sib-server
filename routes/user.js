const express = require('express');
const router = express.Router();
const {User, USER_LEVEL} = require('../db/models/user');
const config = require('../config');
const passport = require('passport');

/* Add new user by admin */
router.post('/', function (req, res, next) {

  try {

    if (req.user.access_level !== USER_LEVEL.ADMIN)
      sendError(res, config.ADMIN_ONLY, 'only admin can do this');

    let user = new User({
      username: req.body.username,
      password: req.body.password,
      firstName: req.body.firstName,
      surname: req.body.surname,
      access_level: req.body.access_level
    });

    user.save().then(doc => {
      res.json({
        error_code: 0,
        id: doc._id
      });

    }).catch(err => {

      sendError(res, err, err.error_code);

    });
  } catch (err) {
    sendError(res, err, null);

  }
});

router.post('/login', passport.authenticate('local', {}), function (req, res, next) {

  res.json({
    username: req.user.username
  });

});

router.get('/logout', (req, res) => {
  req.logout();
  res.sendStatus(200)
});

function sendError(res, err, error_code) {
  res.json({
    error_code: error_code,
    error: err.code ? err.code : err
  });
}

module.exports = router;
