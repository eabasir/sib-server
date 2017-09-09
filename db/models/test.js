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


let testSchema = new Schema( schema_obj, {strict: false});

let Test = mongoose.model('Test', testSchema);

module.exports = {Test};
