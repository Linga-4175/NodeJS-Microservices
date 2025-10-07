const logger = require('../utils/logger');
const authenticateRequest = (req,res,next)=>{
    const userId = req.headers['x-user-id'];
    if(!userId){
        logger.warn(`access attempted without user id`)
        return res.status(200).json({
            success:true,
            message:'Auth required! please login to continue'
        })
    }
    req.user = {userId}
    next();
}

module.exports = {authenticateRequest}