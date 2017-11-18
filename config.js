const app = require('express')();
const env = app.get('env');


const isTest = env === 'test';
const isProd = env === 'production';
const isDev = env === 'development';
const path = require('path');


const ADMIN_ONLY = 410;
const UNAUTHENTICATED_REQUEST = 411;
const FILE_UPLOAD_ERROR = 420;
const FILE_SAVE_DB_ERROR = 421;
const PERSONNEL_SAVE_DB_ERROR = 422;
const PERSONNEL_QUERY_DB_ERROR = 423;
const PERSONNEL_NOT_FOUND_ERROR = 424;
const PERSONNEL_UNSET_DATA_ERROR = 425;
const PERSONNEL_SET_DATA_ERROR = 426;
const DOCUMENT_QUERY_DB_ERROR = 427;
const DOCUMENT_NOT_FOUND_ERROR = 428;
const EXCEL_WRITE_ERROR = 429;

console.log('===> app is running in "', env, '" mode');

let configs = {
  "development": {
    "host": "localhost:3000",
    "db_name": "Sib",
    "db_uri": "mongodb://127.0.0.1:27017/Sib",
    "uploadFolder": "public/documents",
    "exportFolder": "public/exports",
    "downloadFolder": "/documents",
    "downloadExportFolder": "/exports",
  },
  "production": {
    // "host": "localhost:3000",
    "db_name": "Sib-Test",
    "db_uri": process.env.MONGODB_URI,
    "uploadFolder": "public/documents",
    "exportFolder": "public/exports",
    "downloadFolder": "/documents",
    "downloadExportFolder": "/exports",
  }

};


module.exports = {

  host: configs[env].host,
  db_name: configs[env].db_name,
  db_uri: configs[env].db_uri,
  isProd,
  isDev,
  isTest,
  uploadFolder: path.join(__dirname, configs[env].uploadFolder),
  downloadPath: configs[env].host + configs[env].downloadFolder,
  exportFolder: path.join(__dirname, configs[env].exportFolder),
  exportDownloadPath: configs[env].host + configs[env].downloadExportFolder,
  FILE_UPLOAD_ERROR,
  FILE_SAVE_DB_ERROR,
  PERSONNEL_SAVE_DB_ERROR,
  PERSONNEL_QUERY_DB_ERROR,
  PERSONNEL_NOT_FOUND_ERROR,
  PERSONNEL_UNSET_DATA_ERROR,
  PERSONNEL_SET_DATA_ERROR,
  DOCUMENT_QUERY_DB_ERROR,
  DOCUMENT_NOT_FOUND_ERROR,
  EXCEL_WRITE_ERROR,
  ADMIN_ONLY,
  UNAUTHENTICATED_REQUEST
};