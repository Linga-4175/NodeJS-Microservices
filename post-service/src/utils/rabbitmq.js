const amqp = require('amqplib');
const loggger = require('./logger')

let connection = null;
let channel = null;
const EXCHANGE_NAME='facebook_event';

async function connnectToRabbitMQ(){
    try {

        connection = await amqp.connect(process.env.RABBITMQ_URL)
        channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME,'topic',{durable:false})

        loggger.info('connectd rabit mq')

        return channel;
        
    } catch (error) {
        loggger.error('rabbit mq err',error)
    }
}
async function publishEvent(routingKey,message) {
    console.log('publish event start');
    if(!channel){ await connnectToRabbitMQ()}

    channel.publish(EXCHANGE_NAME,routingKey,Buffer.from(JSON.stringify(message)));
    loggger.info('EVENT published',routingKey)
    
}

module.exports = {connnectToRabbitMQ,publishEvent}