/**
 * Created by user on 8/27/2017.
 */
const {Personnel} = require('../db/models/personnel');
const config = require('../config');
var express = require('express');
var router = express.Router();
const {MODEL_NAMES} = require('../db/models/names');
const date = require('../utils/date');
var async = require('async');

router.get('/company-education', function (req, res, next) {


    let result = {};
    let serve_place_query_boj = {};

    serve_place_query_boj[MODEL_NAMES.serve_place + '.value'] = {$ne: ''};

    Personnel.find(serve_place_query_boj).then((personnel) => {


        let result = {};

        let labels = [];
        personnel.forEach(p => {
            labels.push(p.toObject()[MODEL_NAMES.serve_place].value);
        });

        uniquePlaces = labels.filter(function (elem, pos) {
            return labels.indexOf(elem) == pos;
        });


        let educations = [MODEL_NAMES.under_diploma,
            MODEL_NAMES.above_diploma,
            MODEL_NAMES.diploma,
            MODEL_NAMES.Bsc,
            MODEL_NAMES.Msc,
            MODEL_NAMES.phd];


        let promises = [];

        uniquePlaces.forEach(place => {

            result[place] ={};

            educations.forEach(education => {

                promises.push(new Promise((resolve, reject)  =>{

                    let query_obj = {};
                    query_obj[MODEL_NAMES.education + '.value'] = education;
                    query_obj[MODEL_NAMES.serve_place + '.value'] = place;

                    Personnel.find(query_obj).count((err, count) => {

                       result[place][education] = count;
                        resolve();

                    }).catch(err => {
                        console.error(err);
                        result[place][education] = 0;
                        resolve();
                    });
                }));

            });

        });

        Promise.all(promises).then(() => {
                res.json(result);
        }).catch(err => {
            sendError(res, err, config.PERSONNEL_QUERY_DB_ERROR)
        });

    }).catch(err => {
        console.error(err);
        sendError(res, err, config.PERSONNEL_QUERY_DB_ERROR)
    });

});


function sendError(res, err, error_code) {
    res.json({
        error_code: error_code,
        error: err.code ? err.code : err
    });
}
module.exports = router;