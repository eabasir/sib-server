var mongoose = require('mongoose');
const config = require('../config');

mongoose.Promise = global.Promise;

mongoose.connect(config.db_uri , { useMongoClient: true });

mongoose.connection.on('error', error => {
    console.log('error', 'Mongoose connection error: ' + error);
});


module.exports = {mongoose};
