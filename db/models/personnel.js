const mongoose = require('mongoose');
let Schema = mongoose.Schema;
const {MODEL_NAMES} = require('./names');

// can save data ou of schema using strict: false

let schema_obj ={};
schema_obj[MODEL_NAMES.firstName] = {
    type: {
        value :String,
        docs: [String]
    },
    required: true,
    trim: true
};

schema_obj[MODEL_NAMES.surname] = {
    type: {
        value :String,
        docs: [String]
    },
    required: true,
    trim: true
};
schema_obj[MODEL_NAMES.national_code] = {
    type: {
        value :String,
        docs: [String]
    },
    required: true,
    unique : true
};


let personnelSchema = new Schema( schema_obj, {strict: false});

let Personnel = mongoose.model('Personnel', personnelSchema);

module.exports = {Personnel};
