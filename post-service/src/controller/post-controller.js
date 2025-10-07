const logger = require('../utils/logger')
const Post =require('../models/post')
const {publishEvent} = require('../utils/rabbitmq')

async function invalidatePostCache (req,input){

    const cachedKey = `post:${input}`
    await req.redisClient.del(cachedKey)
    const keys = await req.redisClient.keys("posts:*")
    if(keys.length > 0){
        await req.redisClient.del(keys)
    }
}
 const createPost = async(req,res)=>{
      logger.info('createPost Hit')
    try {
    const {content,mediaIds} = req.body;
    const newlyCreatedPost = new Post({
        user:req.user.userId,
        content,
        mediaIds:mediaIds || []

    })
    await newlyCreatedPost.save();
    await publishEvent('post.created',{
    postId:newlyCreatedPost._id.toString(),
    userId:newlyCreatedPost.user.toString(),
    content:newlyCreatedPost.content,
    createdAt:newlyCreatedPost.createdAt
})
    await invalidatePostCache(req,newlyCreatedPost.id.toString())
    logger.info('post created')
    res.status(200).json({
        status:true,
        message:"post created"
    })
      
    } catch (error) {
        logger.error('post-controller err',error)
        res.status(500).json({
           sucess:false,
           message:'int server err' 
        })
    }
}
const getAllPost = async(req,res)=>{
      logger.info('getAllPost Hit')
    try {
      
    const page =parseInt(req.query.page ) || 1;
    const limit = parseInt(req.query.limit) || 10
    const startIndex = (page-1)*limit;

    const cacheKey = `posts:${page}:${limit}`
    const cachedPosts = await req.redisClient.get(cacheKey)
    console.log(cachedPosts);
        if(cachedPosts){
             return res.json(JSON.parse(cachedPosts))
        }
    const posts = await Post.find({}).sort({createdAt:-1}).skip(startIndex).limit(limit);
    const total = await Post.countDocuments();
    const result = {
        posts,
        currentpage:page,
        totalPages:Math.ceil(total/limit),
        totalPosts : posts
    }
     await req.redisClient.setex(cacheKey,300,JSON.stringify(result));
     res.json(result);

    } catch (error) {
        logger.error('getAllPost err',error)
        res.status(500).json({
           sucess:false,
           message:'int server err' 
        })
    }
}

const getPost = async(req,res)=>{
      logger.info('getPost Hit')
    try {
      
    const postId = req.params.id;
    const cachekey = `post:${postId}`
    const cachedPost = await req.redisClient.get(cachekey)
    if(cachedPost){
        return res.json(JSON.parse(cachedPost))
    }
    const singlePostDetailsbyId = await Post.findById(postId);

    if(!singlePostDetailsbyId) {
        return res.status(404).json({
           sucess:false,
           message:'Post Not found' 
        })
    }
    await req.redisClient.setex(cachedPost,3600,JSON.stringify(singlePostDetailsbyId))

    return res.json(singlePostDetailsbyId)
     
    } catch (error) {
        logger.error('getPost err',error)
        res.status(500).json({
           sucess:false,
           message:'int server err' 
        })
    }
}
const deletePost = async(req,res)=>{
      logger.info('deletePost Hit')
    try {
    const post  = await Post.findByIdAndDelete({
        _id:req.params.id,
        user: req.user.userId
    })
        if(!post) {
                return res.status(404).json({
                sucess:false,
                message:'Post Not found' 
                })
            }

// publish post delete method
await publishEvent('post.deleted',{
    postId:post.id.toString(),
    userId:req.user.userId,
    mediaIds:post.mediaIds
})

    await invalidatePostCache(req,req.params.id)
     res.status(200).json({
           sucess:false,
           message:'deleted sucess' 
        })
    } catch (error) {
        logger.error('deletePost err',error)
        res.status(500).json({
           sucess:false,
           message:'int server err' 
        })
    }
}
module.exports = {createPost,getAllPost,getPost,deletePost}