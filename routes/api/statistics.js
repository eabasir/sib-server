/**
 * Created by user on 8/13/2017.
 */

const {Personnel} = require('../../db/models/personnel');
const config = require('../../config');
const express = require('express');
const router = express.Router();
const {MODEL_NAMES} = require('../../db/models/names');
const date = require('../../utils/date');
const isAuthenticated = require('./checkAuthentication');

router.use( isAuthenticated, function (req, res, next) {
  next();
});

/**
 * search for soldier statistics
 */
router.post('/query', function (req, res, next) {

    this.getLimitedStatistics(req).then(result =>{

        res.json(result);
    }).catch(obj =>{

        sendError(res, obj.Error , obj.Error_Code);
    })


});


getLimitedStatistics = req => {
    return new Promise( (resolve, reject) => {

        Personnel.find().count((err, count) => {

            let query_obj = {};

            let result = {};

            if (err) {
                reject({Error: err , Error_Code: config.PERSONNEL_QUERY_DB_ERROR});
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
                        query_obj[key + '.value'] = date.convertJalaliToUTCGregorian(filters[key].value);
                    } else {
                        query_obj[key + '.value'] = {'$regex': filters[key].value};
                    }
                }

            Personnel.find(query_obj, null, queryOptions, (err, personnel) => {

                if (err) {
                    console.error(err);
                    reject({Error: err , Error_Code: config.PERSONNEL_QUERY_DB_ERROR});
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

                    result.data.push(info);
                });


                resolve(result);
            });

        }).catch(err => {
            console.log(err);
            reject({Error: err , Error_Code: config.PERSONNEL_QUERY_DB_ERROR});
        });

    });
};

getFullStatistics = req => {
    return new Promise( (resolve, reject) => {

        Personnel.find().count((err, count) => {

            let query_obj = {};

            let result = [];

            if (err) {
                reject({Error: err , Error_Code: config.PERSONNEL_QUERY_DB_ERROR});
            }

            let  filters;
            if (req.body) {
                filters = req.body['filters'];
            }

            if (filters)
                for (let key in filters) {

                    if (key === MODEL_NAMES.dispatch_date) {
                        query_obj[key + '.value'] = date.convertJalaliToUTCGregorian(filters[key].value);
                    } else {
                        query_obj[key + '.value'] = {'$regex': filters[key].value};
                    }
                }
            Personnel.find(query_obj, null, null, (err, personnel) => {

                if (err) {
                    console.error(err);
                    reject({Error: err , Error_Code: config.PERSONNEL_QUERY_DB_ERROR});
                }

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

                    result.push(info);
                });


                resolve(result);
            });

        }).catch(err => {
            console.log(err);
            reject({Error: err , Error_Code: config.PERSONNEL_QUERY_DB_ERROR});
        });

    });
};


function sendError(res, err, error_code) {
    res.json({
        error_code: error_code,
        error: err.code ? err.code : err
    });
}

module.exports = {
    router,
    getFullStatistics
};