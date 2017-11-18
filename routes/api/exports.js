const {Personnel} = require('../../db/models/personnel');
const config = require('../../config');
var express = require('express');
var router = express.Router();
const {MODEL_NAMES} = require('../../db/models/names');
const date = require('../../utils/date');
const Excel = require('exceljs');
const path = require('path');
let fs = require('fs');
let mkdirp = require('mkdirp');

let sattistics = require('./statistics');
let reports = require('./reports');
const isAuthenticated = require('../checkAuthentication');

router.use( isAuthenticated, function (req, res, next) {
  next();
});

/**
 * this middle ware is used to check and create exports folder
 */
router.use(function (req, res, next) {

    if (!fs.existsSync(config.exportFolder)) {

        mkdirp.sync(config.exportFolder, function (err) {

            if (err) console.error(err);
        })
    }
    next();


});


router.get('/reports', function (req, res, next) {

    reports.getReports(req).then(results => {

        var workbook = new Excel.Workbook();
        var sheet = workbook.addWorksheet('سربازان',
            {
                pageSetup: {paperSize: 9, orientation: 'landscape'}
            });

        sheet.views = [{rightToLeft: true}];
        sheet.autoFilter = 'A1:H1';

        sheet.columns = [
            {header: 'شرکت', key: 'شرکت', width: 10},
            {header: MODEL_NAMES.phd, key: MODEL_NAMES.phd, width: 10},
            {header: MODEL_NAMES.Msc, key: MODEL_NAMES.Msc, width: 10},
            {header: MODEL_NAMES.Bsc, key: MODEL_NAMES.Bsc, width: 10},
            {header: MODEL_NAMES.above_diploma, key: MODEL_NAMES.above_diploma, width: 10},
            {header: MODEL_NAMES.diploma, key: MODEL_NAMES.diploma, width: 10},
            {header: MODEL_NAMES.under_diploma, key: MODEL_NAMES.under_diploma, width: 10},
            {header: 'کل', key: 'کل', width: 10},
        ];


        let rows = [];

        for (let key in results) {

            let companyData = {};
            companyData = results[key];
            companyData['کل'] = getTotalOfEachCompany(companyData);
            companyData['شرکت'] = key;
            rows.push(companyData);
        }

        console.log(rows);
        sheet.addRows(rows);

        let fileName = 'گزارش ' + date.getJalaliNow() + '.xlsx';
        let filePath = path.join(config.exportFolder, fileName);

        workbook.xlsx.writeFile(filePath)
            .then(function () {
                res.json(config.exportDownloadPath + '/' + fileName);
            }).catch(err => {

            sendError(res, err, config.EXCEL_WRITE_ERROR);
        });

    }).catch(obj => {
        sendError(res, obj.Error, obj.Error_Code);
    });


});

router.post('/soldier-table', function (req, res, next) {

    sattistics.getFullStatistics(req).then(results => {

        var workbook = new Excel.Workbook();
        var sheet = workbook.addWorksheet('سربازان',
            {
                pageSetup: {paperSize: 9, orientation: 'landscape'}
            });

        sheet.views = [{rightToLeft: true}];
        sheet.autoFilter = 'A1:M1';

        sheet.columns = [
            {header: MODEL_NAMES.firstName, key: MODEL_NAMES.firstName, width: 10},
            {header: MODEL_NAMES.surname, key: MODEL_NAMES.surname, width: 20},
            {header: MODEL_NAMES.father_name, key: MODEL_NAMES.father_name, width: 10},
            {header: MODEL_NAMES.national_code, key: MODEL_NAMES.national_code, width: 20},
            {header: MODEL_NAMES.dispatch_date, key: MODEL_NAMES.dispatch_date, width: 15},
            {header: MODEL_NAMES.real_discharge_date, key: MODEL_NAMES.real_discharge_date, width: 15},
            {header: MODEL_NAMES.serve_place, key: MODEL_NAMES.serve_place, width: 15},
            {header: MODEL_NAMES.serve_place_part, key: MODEL_NAMES.serve_place_part, width: 15},
            {header: MODEL_NAMES.education_major, key: MODEL_NAMES.education_major, width: 15},
            {header: MODEL_NAMES.education_sub_major, key: MODEL_NAMES.education_sub_major, width: 20},
            {header: MODEL_NAMES.education, key: MODEL_NAMES.education, width: 15},
            {header: MODEL_NAMES.serve_status, key: MODEL_NAMES.serve_status, width: 15},
            {header: MODEL_NAMES.marriage_status, key: MODEL_NAMES.marriage_status, width: 15},
        ];


        sheet.addRows(results);

        let fileName = 'سربازان ' + date.getJalaliNow() + '.xlsx';
        let filePath = path.join(config.exportFolder, fileName);

        workbook.xlsx.writeFile(filePath)
            .then(function () {
                res.json(config.exportDownloadPath + '/' + fileName);
            }).catch(err => {

            sendError(res, err, config.EXCEL_WRITE_ERROR);
        });

    }).catch(obj => {
        sendError(res, obj.Error, obj.Error_Code);
    });


});


getTotalOfEachCompany = value => {

    let phd = Number.parseInt(value[MODEL_NAMES.phd]);
    let msc = Number.parseInt(value[MODEL_NAMES.Msc]);
    let bsc = Number.parseInt(value[MODEL_NAMES.Bsc]);
    let above_diploma = Number.parseInt(value[MODEL_NAMES.above_diploma]);
    let diploma = Number.parseInt(value[MODEL_NAMES.diploma]);
    let under_diploma = Number.parseInt(value[MODEL_NAMES.under_diploma]);

    return phd + msc + bsc + above_diploma + diploma + under_diploma;


};

function sendError(res, err, error_code) {
    res.json({
        error_code: error_code,
        error: err.code ? err.code : err
    });
}

module.exports = router;