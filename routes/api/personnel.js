const {Personnel} = require('../../db/models/personnel');
const config = require('../../config');
var express = require('express');
var router = express.Router();
const {MODEL_NAMES} = require('../../db/models/names');

const isAuthenticated = require('./checkAuthentication');

router.use( isAuthenticated, function (req, res, next) {
  next();
});

/**
 * get specific personnel by id
 */
router.get('/:personnel_id', function (req, res, next) {

    Personnel.findById(req.params.personnel_id).then(personnel => {

        if (personnel)
            res.json(personnel);

        else {
            res.json({
                error_code: config.PERSONNEL_NOT_FOUND_ERROR
            });
        }
    }).catch(err => {
        console.error(err);
        sendError(res, err, config.PERSONNEL_QUERY_DB_ERROR);
    });
});



/**
 * search for personnel
 */
router.post('/query/personnel', function (req, res, next) {


    let firstName_query_boj = {}, surname_query_boj = {}, national_code_query_boj = {};

    firstName_query_boj[MODEL_NAMES.firstName + '.value'] = {'$regex': req.body.query};
    surname_query_boj[MODEL_NAMES.surname + '.value'] = {'$regex': req.body.query};
    national_code_query_boj[MODEL_NAMES.national_code + '.value'] = {'$regex': req.body.query};


    Personnel.find({
        $or: [firstName_query_boj, surname_query_boj, national_code_query_boj]

    }).limit(5).then((personnel) => {

        let result = [];
        personnel.forEach(p => {

            let obj = {};
            obj[MODEL_NAMES.firstName] = p[MODEL_NAMES.firstName].value;
            obj[MODEL_NAMES.surname] = p[MODEL_NAMES.surname].value;
            obj[MODEL_NAMES.national_code] = p[MODEL_NAMES.national_code].value;
            obj._id = p._id;
            result.push(obj);

        });

        console.log(result);
        res.json(result)


    }).catch(err => {
        console.error(err);
        sendError(res, err, config.PERSONNEL_QUERY_DB_ERROR)

    });

});
/**
 * search for general queries
 */
router.post('/query/general', function (req, res, next) {


    let major_query_boj = {};
    major_query_boj[req.body.name + '.value'] = {'$regex': req.body.query};


    Personnel.find(major_query_boj).limit(5).then((personnel) => {

        let result = [];
        personnel.forEach(p => {
            result.push(p.toObject()[req.body.name].value);
        });


        uniqueLabels = result.filter(function (elem, pos) {
            return result.indexOf(elem) == pos;
        });

        res.json(uniqueLabels)


    }).catch(err => {
        console.error(err);
        sendError(res, err, config.PERSONNEL_QUERY_DB_ERROR)

    });

});


router.post('/addNew', function (req, res, next) {

    let obj = {};
    req.body.data.forEach(e => {
        obj[e.key] = {
            value: e.value,
            docs: []
        };
    });

    let personnel = new Personnel(obj);

    personnel.save().then(doc => {
        res.json({
            error_code: 0,
            id: doc._id
        });


    }).catch(err => {
        console.error(err);
        sendError(res, err, config.PERSONNEL_SAVE_DB_ERROR);

    });

});


router.put('/', function (req, res, next) {

    let obj = {};
    let update_unset = {
        $unset: {}
    };
    let update_set = {
        $set: {}
    };

    console.log('id ===> ', req.body);

    Personnel.findById(req.body._id).then(personnel => {


        // using (for in) of pure object make unexpected property in $unset object. so it must be stringify and then parsed to avoid this!
        let str = JSON.stringify(personnel);
        for (let prop in JSON.parse(str)) {

            if (prop !== '__v' && prop !== '_id') {
                update_unset.$unset[prop] = 1;
            }
        }

        req.body.data.forEach(e => {
            obj[e.key] = e.value;
            update_set.$set[e.key] = {
                value: e.value,
                docs: e.docs
            };

        });

        console.log('unset ===> ', update_unset);
        console.log('set ===> ', update_set);

        Personnel.update({
                _id: req.body._id
            },
            update_unset,
            {
                returnOriginal: false
            }).then(result => {

            console.log('unset result ===> ', result);

            Personnel.update({
                    _id: req.body._id
                },
                update_set,
                {
                    returnOriginal: false
                }).then(result => {

                console.log('set result ===> ', result);
                res.json(result);


            }).catch(err => {

                console.error(err);
                sendError(res, err, config.PERSONNEL_SET_DATA_ERROR);

            });


        }).catch(err => {

            console.error(err);
            sendError(res, err, config.PERSONNEL_UNSET_DATA_ERROR);

        });


    }).catch(err => {

        console.error(err);
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
