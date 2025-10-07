const cloudinary = require('cloudinary').v2;
const { error } = require('winston');
const logger = require('./logger')

cloudinary.config({
       cloud_name: 'dgebospjp', 
        api_key: '572361361335283', 
        api_secret: '2ElMdhv4Lh58h0feYH7pNwQqTLE'
})

const uploadMediaToCloudinary = (file)=>{
    return new Promise((resolve,reject)=>{
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type:"auto"
            },
            (error, result)=> {
                if(error){
                    logger.error('Error Upload',error);
                    reject(error)

            }else{
                resolve(result)

            }
        }
        ) 
        uploadStream.end(file.buffer)
    })

}

const deleteMediaFromCloudinary = async(publicId)=>{
    try {
        const result = await cloudinary.uploader.destroy(publicId);
         logger.info('delete file from Cloudinary',publicId);
         return result;
    } catch (error) {
           logger.error('Error deleteMediaFromCloudinary',error);
           throw error;
    }

}
module.exports = {uploadMediaToCloudinary,deleteMediaFromCloudinary}