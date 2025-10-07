const mongoose = require('mongoose')

const refreshTokenSchema = new mongoose.Schema({
    token:{
        type:String,
        required  : true,
        unique:true
    },
    user:{
     type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ reference your User model
      required: true,

    },
    expiresAt:{
        type:Date,
        required  : true
    }
},{
        timestamps:true
    });

    refreshTokenSchema.index({expiresAt:1},{expireAfterSecounds:0});

const refreshToken = mongoose.model('refreshToken',refreshTokenSchema);

module.exports = refreshToken;