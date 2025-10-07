const logger = require('../utils/logger')
const {uploadMediaToCloudinary} = require('../utils/cloudinary')
const Media = require('../models/Media')
const uploadMedia =  async (req , res)=>{
    logger.info('starting media upload');
    try {
        if(!req.file){
             logger.error('file not found');
              return  res.status(400).json({
            sucess:false,
            message:'file not found'
        })
        }
       

        const {originalname,mimetype, buffer} = req.file;
        const userId = req.user.userId;
        logger.info(`file${originalname} ${mimetype}`)
        logger.info(`uploading start`)

        const cloudeinryUploadResult = await uploadMediaToCloudinary(req.file);
        logger.info('upload success',cloudeinryUploadResult.public_id)
        
        const newCreatedMedia = new Media({
            bublicId:cloudeinryUploadResult.public_id,
            originalName:originalname,
            mineType:mimetype,
            url:cloudeinryUploadResult.secure_url,
            userId,
        })
        await newCreatedMedia.save();
         return  res.status(200).json({
            sucess:true,
            message:'upload sucess',
            mediaId:newCreatedMedia.id,
            url:newCreatedMedia.url
        })
    } catch (error) {
          logger.info(`uploading start`,error)
          res.status(500).json({
            sucess:true,
            message:'upload catch error',
        })
    }
}

module.exports = {uploadMedia}