const {Test} = require('../db/models/test');
const config = require('../config');
var express = require('express');
var router = express.Router();
const {MODEL_NAMES} = require('../db/models/names');


router.post('/addNew', function (req, res, next) {

    let obj = {};

    obj[MODEL_NAMES.firstName] = {
        value: req.body[MODEL_NAMES.firstName],
        docs: ['ehsan','ehsan','ehsan','ehsan']
    };

    let test = new Test(obj);

    console.log(test);

    test.save().then(doc => {
        res.json({
            error_code: 0,
            id: doc._id
        });


    }).catch(err => {
        console.error(err);
        sendError(res, err, config.PERSONNEL_SAVE_DB_ERROR);

    });

});



function sendError(res, err, error_code) {
    res.json({
        error_code: error_code,
        error: err.code ? err.code : err
    });
}

module.exports = router;
