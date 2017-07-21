var express = require('express');
var router = express.Router();
const config = require('../config');
const path = require('path');
let fs = require('fs');
let mkdirp = require('mkdirp');

const multer = require('multer');
const moment = require('moment');
const {Document} = require('../db/models/document');

let current_upload_path;
let storage;
let upload;
let current_sub_folder;


router.use(function (req, res, next) {

    if (!current_sub_folder)
        current_sub_folder = moment().format('YYMMDD');

    if (!current_upload_path)
        current_upload_path = path.join(config.uploadFolder ,current_sub_folder);

    if (!fs.existsSync(current_upload_path)) {

        mkdirp.sync(current_upload_path, function (err) {

            if (err) console.error(err);

        })
    }

    if (!storage)
        storage = multer.diskStorage({
            destination: current_upload_path,
            filename: (req, file, cb) => {
                cb(null, [moment().format('HHmmssSSS'), file.originalname].join('-'));
            }
        });

    if (!upload)
        upload = multer({storage: storage}).array('file');

    next();


});

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('test');
});


router.post('/', function (req, res, next) {


    upload(req, res, err => {


        if (err) {
            res.status(config.FILE_UPLOAD_ERROR);
            res.json({
                error_code: config.FILE_UPLOAD_ERROR,
                error: err
            });
            return;
        }


        let download_path = [];
        req.files.forEach(f => {
            let doc = new Document({
                name: f.filename,
                path: f.path

            });

            let download_url = config.downloadPath + "/" + current_sub_folder + "/" + f.filename;
            download_path.push(download_url);
            doc.save(doc =>{
                res.json({
                    error_code: 0,
                    path: download_path
                });
            }, err =>{

                res.status(config.FILE_SAVE_DB_ERROR);
                res.json({
                    error_code: config.FILE_SAVE_DB_ERROR,
                    error: err
                });
            });
        });


    });


});


module.exports = router;
