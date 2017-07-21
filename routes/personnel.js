const {Personnel} = require('../db/models/personnel');
const config = require('../config');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});
router.post('/', function (req, res, next) {

    let body = JSON.parse(req.body.data);

    let firstName = body.filter(x => x.property_name === 'firstName')[0].value;
    let surname = body.filter(x => x.property_name === 'surname')[0].value;
    let extra = body.filter(x => !x.mandatory);


    let obj = {};
    obj.firstName = firstName;
    obj.surname = surname;

    extra.forEach(e => {
        obj[e.key] = e.value;
    });
    let personnel;
    try {
        personnel = new Personnel(obj);
    }
    catch (err) {
        console.log(err);
    }

    personnel.save().then(doc => {
        res.json({
            error_code: 0,
            id: doc._id
        });


    }, err => {
        console.log(err);
        res.status(config.PERSONNEL_SAVE_DB_ERROR);
        res.json({
            error_code: config.PERSONNEL_SAVE_DB_ERROR,
            error: err
        });
    });
});


module.exports = router;
