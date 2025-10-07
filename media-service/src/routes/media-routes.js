const express = require('express')
const multer = require('multer')
const {uploadMedia} = require('../controller/media-controller')
const {authenticateRequest} = require('../middleware/authMiddleware')
const logger = require('../utils/logger')
const { error } = require('winston')
const router = express();
const upload = multer({
    storage:multer.memoryStorage(),
    limits:{
        fileSize:5*1024*1024
    }
}).single('file')

router.post('/upload',authenticateRequest,(req,res,next)=>{
    console.log('router media');
    upload(req,res, function(err){
        if(err instanceof multer.MulterError){
            return res.status(400).json({
                message:'multer error ',
                error:err.message,
                stack:err.stack
            })
        }else if(err){
            return res.status(500).json({
                message:' unknown multer error ',
                error:err.message,
                stack:err.stack
            })
        }
         if(!req.file){
             logger.error('file not found');
              return  res.status(400).json({
            sucess:false,
            message:'file not found'
        })
        }
        next()
    })
},uploadMedia)

module.exports = router