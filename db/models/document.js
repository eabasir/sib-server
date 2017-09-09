const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// can save data ou of schema using strict: false
let docSchema = new Schema({

        name: {
            type: String,
            required: true,
            trim: true
        },
        path: {
            type: String,
            required: true,
            trim: true
        },
        personnel_id: {
            type: String,
            required: true,
            trim: true
        },
        created_at : { type : Date, default: Date.now }

    // }, {timestamps: true},{strict: false});
    },{strict: false});

let Document = mongoose.model('Document', docSchema);

module.exports = {Document};
