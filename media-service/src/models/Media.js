const mongoose = require('mongoose')
const argon2 = require('argon2');

const mediaSchema = new mongoose.Schema({
    bublicId:{
        type:String,
        required  : true
    },
    originalName:{
        type:String,
        required  : true,
    },
    mineType:{
        type:String,
        required  : true
    },
    url:{
        type:String,
        required  : true
    },
    userId:{
        type:String,
        required  : true
    },
    createdAt:{
        type:Date,
        required  : true,
        default:Date.now(),

    }
},{
        timestamps:true
    });

const Media = mongoose.model('Media',mediaSchema);

module.exports = Media;