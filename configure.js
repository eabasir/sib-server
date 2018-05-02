const {User, USER_LEVEL} = require('./db/models/user');
const db = require('./db');

let admin = new User({
  username: 'admin',
  password: 'admin',
  displayName: 'ادمین سامانه',
  userType: USER_LEVEL.ADMIN
});
admin.save().then(res => {
  console.log('-> ', 'admin user is created!');
  process.exit();
}).catch(err => {
  console.log('-> admin creation', err);
  process.exit();
});

// console.log('-> ',admin.save());