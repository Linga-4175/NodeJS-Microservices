require('dotenv').config()
const logger = require('./utils/logger')
const express = require('express');
const helmet = require('helmet')
const app = express();
const cors = require('cors');
const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require('ioredis')
const {rateLimit} = require('express-rate-limit')
const {RedisStore} = require('rate-limit-redis')
const proxy = require('express-http-proxy')
const errorHandler = require('./middleware/errorHandler');
const {validateToken} = require('./middleware/authMiddleware')
const { error } = require('winston');
const PORT = process.env.PORT || 3000;

const redisClient = new Redis(process.env.REDIS_URL)

app.use(helmet())
app.use(cors())
app.use(express.json())

const rateLimiterOptios= rateLimit({
        windowMs: 15*60*1000,
        max:100,
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

app.use(rateLimiterOptios);

app.use((req,res,next)=>{
    logger.info(`Recived ${req.method} request to ${req.url}`);
    logger.info(`Request body ${req.body}`);
    next();
})

const proxyOptions = {
    proxyReqPathResolver:(req)=>{
        const  newPath =  req.originalUrl.replace(/^\/v1/,"/api")
         console.log("🔄 Proxying request:", req.originalUrl, "→", newPath);
         return newPath;
    },
    proxyErrorHandler:(err,res,next)=>{
        logger.error(`Proxy Error ${err.message}`)
        res.status(500).json({
            message:`Proxy Error ${err.message}`
        })
    }
}
app.use('/v1/auth',proxy(process.env.IDENTITY_SERVICE_URL,{
    ...proxyOptions,
    proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
        proxyReqOpts.headers["Content-Type"] = "application/json"

        return proxyReqOpts
    },
    userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`Response recive form identy service:${proxyRes.statusMessage}`)

        return proxyResData;
    }
}))
app.use('/v1/posts',validateToken,proxy(process.env.POST_SERVICE_URL,{
    ...proxyOptions,
    proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
        proxyReqOpts.headers["Content-Type"] = "application/json"
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId
        return proxyReqOpts
    },
    userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`Response recive form identy service:${proxyRes.statusMessage}`)

        return proxyResData;
    }
}))

app.use('/v1/media',validateToken,proxy(process.env.MEDIA_SERVICE_URL,{
    ...proxyOptions,
    proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
        console.log('aaaaaaaaa',srcReq.body);
        if(!srcReq.headers['content-type'].startsWith('multipart/form-data')){
              proxyReqOpts.headers["Content-Type"] = "application/json"
        }
        return proxyReqOpts
    },
    userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`Response recive form media service:${proxyRes.statusMessage}`)

        return proxyResData;
    },
    parseReqBody:false
}))


app.use('/v1/search',validateToken,proxy(process.env.SEARCH_SERVICE_URL,{
    ...proxyOptions,
    proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
        proxyReqOpts.headers["Content-Type"] = "application/json"
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId
        return proxyReqOpts
    },
    userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`Response recive form search service:${proxyRes.statusMessage}`)

        return proxyResData;
    }
}))
app.use(errorHandler)

app.listen(PORT,()=>{
logger.info(`api-getway  runing ${PORT}`)
logger.info(`identity service r runing ${process.env.IDENTITY_SERVICE_URL}`)
logger.info(`post service r runing ${process.env.POST_SERVICE_URL}`)
logger.info(`media service r runing ${process.env.MEDIA_SERVICE_URL}`)
logger.info(`SEARCH_SERVICE_URL service r runing ${process.env.SEARCH_SERVICE_URL}`)
})

process.on('unhandledRejection',(reason,promise)=>{
    logger.error('unhandled rejcetion',promise,"reason:",reason)
})
