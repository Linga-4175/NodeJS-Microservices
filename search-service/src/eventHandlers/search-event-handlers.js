const logger = require('../utils/logger')

const Search = require('../models/Search')

async function handlePostCreated(event){
    console.log(event,"eventevent")
    try {
        const newSrachPost = Search({
            postId:event.postId,
            userId:event.userId,
            content:event.content,
            createdAt:event.createdAt
        })
        await newSrachPost.save();
        logger.info('saved searchpost')
    } catch (error) {
        logger.info('Errror while media dele',error)
    }
}

module.exports = {handlePostCreated}