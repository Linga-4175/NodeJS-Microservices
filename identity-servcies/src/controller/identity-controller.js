const logger = require('../utils/logger')
const {validationRegisteration,validationLogin} = require('../utils/validations');
const User = require('../models/User');
const generateTokens = require('../utils/generateToken');
const RefreshToken = require('../models/RefreashToken');
 const registerUser = async(req,res)=>{
      logger.info('Register Hit')
    try {
      const {error} = validationRegisteration(req.body);
      if(error){
        logger.warn('Val error',error.details[0].message);
        return res.status(400).json({
            sucess:false,
            message:error.details[0].message
        })
      }
      const {email,password,username} = req.body;
      let user = await User.findOne({$or:[{email},{username}]});
      if(user) { 
        logger.warn('User alredy exist error');
         return res.status(400).json({
            sucess:false,
            message:'User alredy exist error'
        })
    }
    user = new User({username,email,password})
    await user.save();
     logger.info('User saved',user.id);
     const {accessToken,refreshToken} = await generateTokens(user);
     res.status(200).json({
        success:true,
        message:'user saved scesss',
        accessToken,
        refreshToken
     })

     
    } catch (error) {
        logger.error('reg err',error)
        res.status(500).json({
           sucess:false,
           message:'int server err' 
        })
    }
}
const loginUser = async(req,res)=>{
  logger.info('loginUser Hit')
    try {
    const {error}  = validationLogin(req.body)
      if(error){
        logger.warn('Val error',error.details[0].message);
        return res.status(400).json({
            sucess:false,
            message:error.details[0].message
        })
      }
      const {email , password} = req.body;

      const user = await User.findOne({email})  
      if(!user){
        logger.warn('Invalid User');
        return res.status(400).json({
            sucess:false,
            message:'Invalid login details'
        })
      }

      const isValidPass = await user.comparePassword(password);
      if(!isValidPass){
        logger.warn('Invalid User');
        return res.status(400).json({
            sucess:false,
            message:'Invalid Pass'
        })
      }

      const {accessToken,refreshToken} = await generateTokens(user);
      res.json({
        accessToken,
        refreshToken,
        userId:user.id
      })

    } catch (error) {
        logger.error('Login err',error)
        res.status(500).json({
           sucess:false,
           message:'int server err' 
        })
    }
}
const refreshTokenUser= async(req,res)=>{
  logger.info('refreshToken Hit')
    try {
      const {refreshTokenReq} = req.body;
      if(!refreshTokenReq){
          logger.warn('Refresh token missing User');
        return res.status(400).json({
            sucess:false,
            message:'Refresh token missing'
        })
      }

      const storedToken = await RefreshToken.findOne({token:refreshTokenReq})  
      if(!storedToken || storedToken.expiresAt < new Date()){
        logger.warn('Invalid or expired referesh token');
        return res.status(400).json({
            sucess:false,
            message:'Invalid or expired referesh token'
        })
      }
      const user = await User.findById(storedToken.user)
      if(!user){
         logger.warn('User not found');
        return res.status(400).json({
            sucess:false,
            message:'User not found'
        })
      }
      const {accessToken,refreshToken} = await generateTokens(user);
      await RefreshToken.deleteOne({id:storedToken.id})
      res.json({
        accessToken,
        refreshToken,
        userId:user.id
      })

    } catch (error) {
        logger.error('refreshToken err',error)
        res.status(500).json({
           sucess:false,
           message:'int server err' 
        })
    }
}

const logoutUser= async(req,res)=>{
  logger.info('logoutUser Hit')
    try {
      const {refreshTokenReq} = req.body;
      if(!refreshTokenReq){
          logger.warn('Refresh token missing User');
        return res.status(400).json({
            sucess:false,
            message:'Refresh token missing'
        })
      }

     await RefreshToken.deleteOne({token:refreshTokenReq})
      logger.info("deleted refresh token for logout")
      res.json({
        success:true,
        messga:'Logut Sucess'
      })
    } catch (error) {
        logger.error('logoutUser err',error)
        res.status(500).json({
           sucess:false,
           message:'int server err' 
        })
    }
}
module.exports = {registerUser,loginUser,refreshTokenUser,logoutUser}