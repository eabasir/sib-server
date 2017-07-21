
const app = require('express')();
const env = app.get('env');


const isTest = env==='test';
const isProd = env==='production';
const isDev  = env==='development';
const path = require('path');


const FILE_UPLOAD_ERROR = 420;
const FILE_SAVE_DB_ERROR = 421;
const PERSONNEL_SAVE_DB_ERROR = 422;

console.log('===> app is running in "' ,env , '" mode');

let configs = {
    "development": {
        "host": "localhost:3000",
        "db_name": "Sib",
        "db_uri": "mongodb://127.0.0.1:27017/Sib",
        "uploadFolder": "public/documents",
        "downloadFolder": "/documents",
    },
    "production": {
        // "host": "localhost:3000",
        "db_name": "Sib-Test",
        "db_uri": process.env.MONGODB_URI,
        "uploadFolder": "public/documents",
        "downloadFolder": "/documents"
    }

};


module.exports = {
    db_name: configs[env].db_name,
    db_uri: configs[env].db_uri,
    isProd,
    isDev,
    isTest,
    uploadFolder: path.join(__dirname, configs[env].uploadFolder),
    downloadPath: configs[env].host + configs[env].downloadFolder,
    FILE_UPLOAD_ERROR,
    FILE_SAVE_DB_ERROR,
    PERSONNEL_SAVE_DB_ERROR
};