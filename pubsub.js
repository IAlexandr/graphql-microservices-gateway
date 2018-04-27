import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

const options = {
  port: 32768,
  retryStrategy: options => {
    return 10000;
  },
  showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
};
const redisSubscriber = new Redis(options);
const redisPublisher = new Redis(options);

const connceted = () => {
  console.log('Redis connection port', options.port);
};
const error = err => {
  console.log('Redis connection error', err.message);
};
redisSubscriber.on('connect', connceted);
redisSubscriber.on('error', error);
redisPublisher.on('error', () => {});

const pubsub = new RedisPubSub({
  publisher: redisPublisher,
  subscriber: redisSubscriber,
});

export default pubsub;
