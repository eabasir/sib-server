let express = require('express');
let router = express.Router();
const config = require('../../config');
const path = require('path');
let fs = require('fs');
let mkdirp = require('mkdirp');
let jmoment = require('jalali-moment');
const isAuthenticated = require('./checkAuthentication');


const multer = require('multer');
const moment = require('moment');
const {Document} = require('../../db/models/document');
const {Personnel} = require('../../db/models/personnel');
const {MODEL_NAMES} = require('../../db/models/names');

let current_upload_path;
let storage;
let upload;
let current_sub_folder;


router.use( isAuthenticated, function (req, res, next) {
  next();
});


/**
 * this middle ware is used to check and create current upload folder
 */
router.use(function (req, res, next) {

    if (!current_sub_folder)
        current_sub_folder = moment().format('YYMMDD');

    if (!current_upload_path)
        current_upload_path = path.join(config.uploadFolder, current_sub_folder);

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

/**
 * get specific document
 */
router.get('/:personnel_id', function (req, res, next) {

    Document.find({
        personnel_id: req.params.personnel_id
    }).then(documents => {

        let result = [];

        documents.forEach(d => {

            result.push({
                name: d.name,
                path: d.path,
                _id: d._id
            });

        });


        res.json(documents);


    }).catch(err => {

        console.error(err);
        sendError(res, err, config.DOCUMENT_QUERY_DB_ERROR);

    });

});

/**
 * get info of specific document
 */

router.get('/getInfo/:document_id', function (req, res, next) {

    Document.findById(req.params.document_id).then(document => {

        if (document) {

            Personnel.findById(document.personnel_id).then(personnel => {

                if (personnel) {

                    let result = document.toObject();
                    result['personnel_full_name'] = personnel[MODEL_NAMES.firstName].value + ' '
                        + personnel[MODEL_NAMES.surname].value + ' - '
                        + personnel[MODEL_NAMES.national_code].value;

                    res.json(result);
                } else
                    sendError(res, err, config.PERSONNEL_NOT_FOUND_ERROR);

            }).catch(err => {
                sendError(res, err, config.PERSONNEL_QUERY_DB_ERROR);
            })
        } else {
            sendError(res, '', config.DOCUMENT_NOT_FOUND_ERROR)
        }


    }).catch(err => {
        console.error(err);
        sendError(res, err, config.DOCUMENT_QUERY_DB_ERROR);
    });

});


router.post('/:personnel_id', function (req, res, next) {
    upload(req, res, err => {


        if (err) {
            res.status(config.FILE_UPLOAD_ERROR);
            res.json({
                error_code: config.FILE_UPLOAD_ERROR,
                error: err
            });
            return;
        }

        let all_done = true;

        req.files.forEach(f => {
            let doc = new Document({
                name: f.filename,
                path: f.path.replace(config.uploadFolder, config.downloadPath).replace(config.host, ""),
                personnel_id: req.params.personnel_id

            });

            // let download_url = config.downloadPath + "/" + current_sub_folder + "/" + f.filename;
            // download_path.push(download_url);
            doc.save(doc => {

            }, err => {
                all_done = false;
            });
        });

        if (all_done) {

            res.json({
                error_code: 0,
                // path: download_path
            });
        } else {
            res.json({
                error_code: config.FILE_SAVE_DB_ERROR,
                error: err
            });
        }


    });


});


/**
 * advance search in documents
 */

router.post('/search/query', function (req, res, next) {

    let utcFromDate, utcToDate;

    let from_date = req.body['from_date'];
    if (from_date) {
        utcFromDate = moment.utc(from_date).format();
    }

    let to_date = req.body['to_date'];
    if (to_date) {
        utcToDate = moment.utc(to_date).format(); // 1 day is added to for containing current day in query
    }

    let created_at;

    if (utcFromDate && !utcToDate)
        created_at = {
            $gte: new Date(utcFromDate)
        };
    else if (!utcFromDate && utcToDate)
        created_at = {
            $lt: new Date(utcToDate)
        };
    else if (utcFromDate && utcToDate)
        created_at = {
            $gte: new Date(utcFromDate),
            $lt: new Date(utcToDate)
        };

    console.log(created_at);

    let query_obj = {};

    req.body.data.forEach(d => {
        query_obj['info.' + d.key] = {'$regex': d.value};
    });


    if (created_at) {
        query_obj.created_at = created_at;

    }

    if (req.body.personnel_id) {
        query_obj.personnel_id = req.body.personnel_id;
    }

    console.log(query_obj);

    Document.find(query_obj).then(documents => {
        let result = [];

        documents.forEach(d => {

            result.push({
                name: d.name,
                path: d.path,
                _id: d._id
            });

        });

        res.json(documents);

    }).catch(err => {

        console.error(err);
        sendError(res, err, config.DOCUMENT_QUERY_DB_ERROR);

    });

});

/**
 * update info of specific document
 */

router.put('/:document_id', function (req, res, next) {



    // todo : make this completed!
    if (req.body.filedName) {
        let field_document_query_boj = {};
        field_document_query_boj[req.body.fieldname + '.docs'] = {$elemMatch: req.params.document_id};

    }

    Document.findByIdAndUpdate(
        req.params.document_id,
        {
            $set: {
                info: req.body
            }
        },
        {new: true}
    ).then(document => {
        if (!document) {
            console.error(err);
            sendError(res, err, config.DOCUMENT_QUERY_DB_ERROR);
        }

        res.json({
            error_code: 0,
        });

    }).catch(err => {
        console.error(err);
        sendError(res, err, config.DOCUMENT_QUERY_DB_ERROR);

    });


});

/**
 * delete specific document
 */

router.delete('/:document_id', function (req, res, next) {

    console.log('id ===> ', req.params.document_id);


    Document.findByIdAndRemove(req.params.document_id).then(document => {
        if (!document) {
            console.error(err);
            sendError(res, err, config.DOCUMENT_QUERY_DB_ERROR);
        }

        res.json({
            error_code: 0,
        });

    }).catch(err => {
        console.error(err);
        sendError(res, err, config.DOCUMENT_QUERY_DB_ERROR);

    });


});


function sendError(res, err, error_code) {
    res.json({
        error_code: error_code,
        error: err.code ? err.code : err
    });
}


module.exports = router;
