/**
 * Created by user on 8/13/2017.
 */

const {Personnel} = require('../db/models/personnel');
const config = require('../config');
var express = require('express');
var router = express.Router();
const {MODEL_NAMES} = require('../db/models/names');
const date = require('../utils/date');
/**
 * search for soldier statistics
 */
router.post('/query', function (req, res, next) {


    Personnel.find().count((err, count) => {

        let query_obj = {};

        let result = {};

        if (err) {
            sendError(res, err, config.PERSONNEL_QUERY_DB_ERROR);
            return;
        }

        result.totalRecords = count;

        let first, sortField, sortOrder, filters;
        if (req.body) {
            first = req.body['first'] || 0;
            sortField = req.body['sortField'] || 0;
            sortOrder = req.body['sortOrder'] || 1;
            filters = req.body['filters'];
        }

        let queryOptions = {limit: 10};

        if (first)
            queryOptions.skip = first;

        if (sortField) {
            queryOptions.sort = {};
            queryOptions.sort[sortField] = sortOrder;
        }
        if (filters)
            for (let key in filters) {

                if (key === MODEL_NAMES.dispatch_date) {
                    console.log('jalali ==> ', filters[key].value);
                    query_obj[key + '.value'] = date.convertJalaliToUTCGregorian(filters[key].value);
                } else {
                    query_obj[key + '.value'] = {'$regex': filters[key].value};
                }
            }
        console.log('query options ===> ', queryOptions);
        console.log('query obj ===> ', query_obj);

        Personnel.find(query_obj, null, queryOptions, (err, personnel) => {

            if (err) {
                console.error(err);
                sendError(res, err, config.PERSONNEL_QUERY_DB_ERROR);
                return;
            }

            result.data = [];

            personnel.forEach(p => {


                let info = {};
                info[MODEL_NAMES.firstName] = p.toObject()[MODEL_NAMES.firstName].value;
                info[MODEL_NAMES.surname] = p.toObject()[MODEL_NAMES.surname].value;
                info[MODEL_NAMES.father_name] = p.toObject()[MODEL_NAMES.father_name].value;
                info[MODEL_NAMES.national_code] = p.toObject()[MODEL_NAMES.national_code].value;
                info[MODEL_NAMES.dispatch_date] = date.convertUTCGregorianToJalali(p.toObject()[MODEL_NAMES.dispatch_date].value);
                info[MODEL_NAMES.real_discharge_date] = date.convertUTCGregorianToJalali(p.toObject()[MODEL_NAMES.real_discharge_date].value);
                info[MODEL_NAMES.serve_place] = p.toObject()[MODEL_NAMES.serve_place].value;
                info[MODEL_NAMES.serve_place_part] = p.toObject()[MODEL_NAMES.serve_place_part].value;
                info[MODEL_NAMES.education_major] = p.toObject()[MODEL_NAMES.education_major].value;
                info[MODEL_NAMES.education_sub_major] = p.toObject()[MODEL_NAMES.education_sub_major].value;
                info[MODEL_NAMES.education] = p.toObject()[MODEL_NAMES.education].value;
                info[MODEL_NAMES.serve_status] = p.toObject()[MODEL_NAMES.serve_status].value;
                info[MODEL_NAMES.marriage_status] = p.toObject()[MODEL_NAMES.marriage_status].value;

                console.log(info);

                result.data.push(info);
            });


            res.json(result)


        });

    }).catch(err => {
        console.log(err);
        sendError(res, err, config.PERSONNEL_QUERY_DB_ERROR);
    });


});


function sendError(res, err, error_code) {
    res.json({
        error_code: error_code,
        error: err.code ? err.code : err
    });
}

module.exports = router;