
const jwt = require('jsonwebtoken')

const validateToken = (req,res,next)=>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1]
 
    if(!token){
        return res.status(400).json({
            success:false,
            message:'authentication required'
        })
    }
    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
        if(err){
              return res.status(429).json({
            success:false,
            message:'Invalid Token'
        })
        }
         req.user = user
     next()
    })
   
}
module.exports = {validateToken}