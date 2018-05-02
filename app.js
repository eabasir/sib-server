const express = require('express');
const session = require('express-session');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const user = require('./routes/api/user');
const document = require('./routes/api/document');
const personnel = require('./routes/api/personnel');
const dashboard = require('./routes/api/dashboard');
const statistics = require('./routes/api/statistics');
const reports = require('./routes/api/reports');
const exp = require('./routes/api/exports');
const sessionStore = require('sessionstore');
const app = express();

const {mongoose} = require('./db');
const config = require('./config');


app.use(session({
  store: sessionStore.createSessionStore({
      type: 'mongodb',
      host: config.mongoHost,
      port: config.mongoPort,
      dbName: config.sessionDbName,
      collectionName: config.sessionCollectionName,

    }
  ),
  secret: 'sibsecret',

}));
const passport = require('./passport');

//
// //view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');
//
// // uncomment after placing your favicon in /public
// // app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

//todo: investigate!!!
app.use((req, res, next) => {

  // res.header("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
  res.header("Access-Control-Allow-Origin", "http://localhost:4200");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // res.header("Access-Control-Allow-Credentials", true);

  next();
});

passport.setup(app);

app.use('/api/users', user);
app.use('/api/document', document);
app.use('/api/personnel', personnel);
app.use('/api/dashboard', dashboard);
app.use('/api/statistics', statistics.router);
app.use('/api/reports', reports.router);
app.use('/api/exports', exp);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  let jsonError = req.app.get('env') === 'development' ? {
    Message: err.message,
    Stack: err.stack,
  } : {Message: err};
  res.status(err.status || 500).json(jsonError);

});

module.exports = app;
