/**
 * Created by Amin on 04/02/2017.
 */
let badPass = new Error("Incorrect password");
badPass.status = 400;

let noUser = new Error("Incorrect Username");
noUser.status = 400;

let adminOnly = new Error("Only admin can do this.");
adminOnly.status = 400;

let emptyUsername = new Error("Empty username is not allowed");
emptyUsername.status = 400;

let unAuthenticateUser = new Error("unauthenticated request");
unAuthenticateUser.status =400;

module.exports = {
  badPass,
  noUser,
  adminOnly,
  emptyUsername,
  unAuthenticateUser
};