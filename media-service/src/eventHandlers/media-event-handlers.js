const logger = require('../utils/logger')
const Media = require("../models/Media")
const {deleteMediaFromCloudinary} = require("../utils/cloudinary")
const handlePostDeleted = async (event)=>{
    console.log(event,"eventevent")
    const {postId,mediaIds} = event;
    try {
        const mediaDelete = await Media.find({_id:{$in:mediaIds}})
        for(const media of mediaDelete){
            await deleteMediaFromCloudinary(media.bublicId)
            await Media.findByIdAndDelete(media.id)
            logger.info("deleted media")
        }
    } catch (error) {
        logger.info('Errror while media dele',error)
    }
}

module.exports = {handlePostDeleted}