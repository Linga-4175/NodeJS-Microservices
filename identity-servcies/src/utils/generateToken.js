const jwt = require('jsonwebtoken');
const crypto = require('crypto')

const RefreshToken = require('../models/RefreashToken');

const generateTokens = async (user)=>{
    const accessToken = jwt.sign({
        userId:user.id,
        username:user.username
    },process.env.JWT_SECRET,{expiresIn:'60m'})

    const refreshToken = crypto.randomBytes(40).toLocaleString('hex');
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate()+7);

    await RefreshToken.create({
        token : refreshToken,
        user : user.id,
        expiresAt:expireAt
    })
    return {accessToken,refreshToken}
}

module.exports = generateTokens;