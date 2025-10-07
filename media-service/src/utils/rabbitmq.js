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

    if(!channel){ await connnectToRabbitMQ()}

    channel.publish(EXCHANGE_NAME,routingKey,Buffer.from(JSON.stringify(message)));
    loggger.info('EVENT published',routingKey)
    
}
async function consumeEvent(routingKey, callback) {
  if (!channel) { 
    await connnectToRabbitMQ();
  }

  const q = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);

  channel.consume(q.queue, (msg) => {
    if (msg !== null) {
      const content = JSON.parse(msg.content.toString());
      if (typeof callback === 'function') {
        callback(content);
      } else {
        console.error(`⚠️ No valid callback function for routing key: ${routingKey}`);
      }
      channel.ack(msg);
    }
  });

  loggger.info('Subscribed to event:', routingKey);
}


module.exports = {connnectToRabbitMQ,publishEvent,consumeEvent}