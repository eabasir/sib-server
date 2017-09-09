/**
 * Created by user on 8/13/2017.
 */

const {Personnel} = require('../db/models/personnel');
const config = require('../config');
var express = require('express');
var router = express.Router();
const {MODEL_NAMES} = require('../db/models/names');
const date = require('../utils/date');
var async = require('async');


router.get('/general', function (req, res, next) {


    let result = {};

    Personnel.count({}, (err, count) => {

        result.total = count;

        let in_serve_query_obj = {};
        in_serve_query_obj[MODEL_NAMES.serve_status + '.value'] = MODEL_NAMES.serve_status_in_serve;
        Personnel.find(in_serve_query_obj).count((err, count) => {

            result.in_serve = count;

            let added_in_query_obj = {};
            added_in_query_obj[MODEL_NAMES.serve_status + '.value'] = MODEL_NAMES.serve_status_in_serve;
            added_in_query_obj[MODEL_NAMES.dispatch_date + '.value'] = {$gte: date.getGregorianStartOfMonth()};
            Personnel.find(added_in_query_obj).count((err, count) => {

                result.added_in = count;

                let go_out_query_obj = {};
                go_out_query_obj[MODEL_NAMES.serve_status + '.value'] = MODEL_NAMES.serve_status_discharged;
                go_out_query_obj[MODEL_NAMES.real_discharge_date + '.value'] = {
                    $gt: date.getGregorianStartOfMonth(),
                    $lte: date.getGregorianEndOfMonth()};
                Personnel.find(go_out_query_obj).count((err, count) => {

                    result.go_out = count;
                    res.send(result);

                }).catch(err => {
                    console.error(err);
                    sendError(res, err, config.PERSONNEL_QUERY_DB_ERROR)
                });


            }).catch(err => {
                console.error(err);
                sendError(res, err, config.PERSONNEL_QUERY_DB_ERROR)
            });

        }).catch(err => {
            console.error(err);
            sendError(res, err, config.PERSONNEL_QUERY_DB_ERROR)
        });

    });


});

router.get('/company-statistics', function (req, res, next) {


    let result = {

        labels: [],
        series: [],
    };
    let serve_place_query_boj = {};

    serve_place_query_boj[MODEL_NAMES.serve_place + '.value'] = {$ne: ''};

    Personnel.find(serve_place_query_boj).then((personnel) => {

        let labels = [];
        personnel.forEach(p => {
            labels.push(p.toObject()[MODEL_NAMES.serve_place].value);
        });

        uniquePlaces = labels.filter(function (elem, pos) {
            return labels.indexOf(elem) == pos;
        });

        result.labels = uniquePlaces;


        let promises = result.labels.map((label, index) => {

            return new Promise((resolve, reject) => {
                let company_query_obj = {};
                company_query_obj[MODEL_NAMES.serve_status + '.value'] = MODEL_NAMES.serve_status_in_serve;
                company_query_obj[MODEL_NAMES.serve_place + '.value'] = label;

                Personnel.find(company_query_obj).count((err, count) => {
                    result.labels[index] = label + ' (' + count + ')';
                    result.series[index] = count;
                    resolve();

                }).catch(err => {
                    console.error(err);
                    result.series[index] = 0;
                    resolve();
                });

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


router.get('/added-in-six-month', function (req, res, next) {
    let result = {

        labels: [],
        series: []

    };
    result.labels = date.getGregorianLastSixMonth();

    let promises = result.labels.map((utcDate, index) => {

        return new Promise((resolve, reject) => {

            result.labels[index] = date.convertUTCGregorianToJalali(result.labels[index]);


            let date_range = {$gte: utcDate};
            if (index < (result.labels.length - 1))
                date_range.$lt = result.labels[index + 1];
            else
                date_range.$lt = date.getGregorianStartOfNextMonth();

            let dispatch_date_query_obj = {};
            dispatch_date_query_obj[MODEL_NAMES.dispatch_date + '.value'] = date_range;
            Personnel.find(dispatch_date_query_obj).count((err, count) => {
                result.series[index] = count;

                resolve();

            }).catch(err => {
                console.error(err);
                result.series[index] = 0;

                resolve();
            });

        });

    });
    Promise.all(promises).then(() => {
        res.json(result);

    }).catch(err => {
        console.error(err);
        sendError(res, err, config.PERSONNEL_QUERY_DB_ERROR)
    });

});
router.get('/go-out-six-month', function (req, res, next) {
    let result = {

        labels: [],
        series: []

    };
    result.labels = date.getGregorianLastSixMonth();

    let promises = result.labels.map((utcDate, index) => {

        return new Promise((resolve, reject) => {

            result.labels[index] = date.convertUTCGregorianToJalali(result.labels[index]);


            let date_range = {$gte: utcDate};
            if (index < (result.labels.length - 1))
                date_range.$lt = result.labels[index + 1];
            else
                date_range.$lt = date.getGregorianStartOfNextMonth();


            let legal_discharge_date_query_obj = {};
            legal_discharge_date_query_obj[MODEL_NAMES.real_discharge_date + '.value'] = date_range;
            legal_discharge_date_query_obj[MODEL_NAMES.serve_status + '.value'] = MODEL_NAMES.serve_status_discharged;
            Personnel.find(legal_discharge_date_query_obj).count((err, count) => {
                result.series[index] = count;

                resolve();

            }).catch(err => {
                console.error(err);
                result.series[index] = 0;

                resolve();
            });

        });

    });
    Promise.all(promises).then(() => {
        res.json(result);

    }).catch(err => {
        console.error(err);
        sendError(res, err, config.PERSONNEL_QUERY_DB_ERROR)
    });

});

router.get('/go-out-in-six-month', function (req, res, next) {
    let result = {

        labels: [],
        series: []

    };
    result.labels = date.getGregorianFutureSixMonth();

    let promises = result.labels.map((utcDate, index) => {

        return new Promise((resolve, reject) => {

            result.labels[index] = date.convertUTCGregorianToJalali(result.labels[index]);


            let date_range = {$gte: utcDate};
            if (index < (result.labels.length - 1))
                date_range.$lt = result.labels[index + 1];
            else
                date_range.$lt = date.getGregorianStartOfSevenLaterMonth();

            let legal_discharge_date_query_obj = {};
            legal_discharge_date_query_obj[MODEL_NAMES.real_discharge_date + '.value'] = date_range;
            legal_discharge_date_query_obj[MODEL_NAMES.serve_status + '.value'] = MODEL_NAMES.serve_status_in_serve;

            console.log(legal_discharge_date_query_obj);

            Personnel.find(legal_discharge_date_query_obj).count((err, count) => {
                result.series[index] = count;
                resolve();

            }).catch(err => {
                console.error(err);
                result.series[index] = 0;

                resolve();
            });

        });

    });
    Promise.all(promises).then(() => {

        res.json(result);

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