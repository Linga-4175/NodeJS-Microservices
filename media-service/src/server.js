
require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose')
const logger = require('./utils/logger')
const helmet = require('helmet')
const cors = require('cors');
const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require('ioredis')
const {rateLimit} = require('express-rate-limit')
const {RedisStore} = require('rate-limit-redis')
const errorHandler = require('./middleware/errorHandler')
const mediaRoutes = require('./routes/media-routes');
const { consumeEvent } = require('./utils/rabbitmq');
const app = express();
const { connnectToRabbitMQ } = require('./utils/rabbitmq');
const {handlePostDeleted} = require('./eventHandlers/media-event-handlers')
const PORT = process.env.PORT || 3003;



async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10s
    });
    console.log("✅ MongoDB Atlas connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

connectDB();
const redisClient = new Redis(process.env.REDIS_URL)
app.use(helmet())
app.use(cors())
app.use(express.json())

app.use((req,res,next)=>{
    logger.info(`Recived ${req.method} request to ${req.url}`);
    logger.info(`Request body ${req.body}`);
    next();
})

const rateLimiter = new RateLimiterRedis({
    storeClient:redisClient,
    keyPrefix: 'middleware',
    points: 10,
    duration: 1
})

app.use((req,resp,next)=>{
    rateLimiter.consume(req.ip).then(()=>next()).catch((e)=>{
        logger.warn(`Rate limite exceed for ip ${req.ip}`)
        resp.status(429).json({
            success:false,
            message:'to many request'
        })
    })
})

const sensetiveEndPointLimit= rateLimit({
windowMs: 15*60*1000,
max:50,
standardHeaders:true,
legacyHeaders:false,
handler:(req,res)=>{
    logger.warn(`send end rate limit exedd for ip ${req.ip}`)
      res.status(429).json({
            success:false,
            message:'to many requests'
        })
},
store : new RedisStore({
    sendCommand:(...args)=> redisClient.call(...args)
})
})

// app.use('/api/auth/register',sensetiveEndPointLimit)

app.use('/api/media/',mediaRoutes)

app.use(errorHandler)
async function startServer(){
  try {
    await connnectToRabbitMQ();
    await consumeEvent('post.deleted',handlePostDeleted);
    app.listen(PORT,()=>{
    logger.info(`media service runing ${PORT}`)
})
  } catch (error) {
    logger.error('failed to connect server',error);
    process.exit(1);
  }
}
startServer();
process.on('unhandledRejection',(reason,promise)=>{
    logger.error('unhandled rejcetion',promise,"reason:",reason)
})
