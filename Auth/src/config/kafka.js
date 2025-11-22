const { Kafka } = require('kafkajs');

let kafka = null;
let producer = null;
let consumer = null;

const initKafka = () => {
  kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || 'auth-service',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  });

  producer = kafka.producer();
  consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID || 'auth-service-group' });

  return { kafka, producer, consumer };
};

const connectKafka = async () => {
  try {
    if (!producer || !consumer) {
      initKafka();
    }

    await producer.connect();
    console.log('Kafka Producer Connected');

    await consumer.connect();
    console.log('Kafka Consumer Connected');

    // Subscribe to relevant topics
    await consumer.subscribe({ topics: ['user-events', 'auth-events'], fromBeginning: false });

    return { producer, consumer };
  } catch (error) {
    console.error('Kafka connection error:', error);
    throw error;
  }
};

const getKafkaProducer = () => {
  if (!producer) {
    initKafka();
  }
  return producer;
};

const publishEvent = async (topic, event) => {
  try {
    const producer = getKafkaProducer();
    await producer.send({
      topic,
      messages: [
        {
          key: event.userId || event.id || 'default',
          value: JSON.stringify({
            ...event,
            timestamp: new Date().toISOString(),
            service: 'auth-service',
          }),
        },
      ],
    });
    console.log(`Event published to topic: ${topic}`);
  } catch (error) {
    console.error('Error publishing event:', error);
    throw error;
  }
};

module.exports = { connectKafka, getKafkaProducer, publishEvent };

