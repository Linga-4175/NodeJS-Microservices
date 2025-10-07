const logger = require('../utils/logger')
const Search =require('../models/Search')
// const {publishEvent} = require('../utils/rabbitmq')
 const searchPostController = async(req,res)=>{
      logger.info('search controller Hit')
    try {
        const {query} = req.query;
        const results = await Search.find({
            $text:{$search:query}
        },
       { score:{$meta:'textScore'}}
    ).sort({ score:{$meta:'textScore'}}).limit(10)

    res.json(results);
      
    } catch (error) {
        logger.error('search err',error)
        res.status(500).json({
           sucess:false,
           message:'int server err' 
        })
    }
}
module.exports = {searchPostController}