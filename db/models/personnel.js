const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// can save data ou of schema using strict: false
let personnelSchema = new Schema({


    firstName:{
        type: String,
        required: true,
        trim: true
    },
    surname: {
        type: String,
        required: true,
        trim: true
    }/*,
    isSoldier:{
        type: Boolean,
        required:true
    }*/

}, {strict: false});

let Personnel = mongoose.model('Personnel', personnelSchema);

module.exports = {Personnel};
