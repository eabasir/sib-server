const mongoose = require('mongoose');
let Schema = mongoose.Schema;
const errors = require('../../errors.list');
// can save data ou of schema using strict: false


let USER_LEVEL = {

  ADMIN: 0,
  MANAGER: 1,
  ASSISTANT: 2,
  VISITOR: 3
};

let schema_obj = {
  displayName: {
    type: String,
    required: true,
    trim: true
  },

  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  userType: {
    type: Number,
    required: true,
    trim: true
  }


};


let loginCheck = (req, username, password) => {
  return User.find({username: username}).then(res => {
    let result = res[0].toObject();
    if (!result) {
      return Promise.reject(errors.noUser);
    }
    if (result.password !== password) {
      return Promise.reject(errors.badPass);
    }

    return Promise.resolve(result)
  })

};

let userSchema = new Schema(schema_obj, {strict: true});

let User = mongoose.model('User', userSchema);

module.exports = {
  User,
  USER_LEVEL,
  loginCheck

};
