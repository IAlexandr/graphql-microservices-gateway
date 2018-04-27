import { RedisPubSub } from 'graphql-redis-subscriptions';

const options = {
  port: 32768,
  retryStrategy: options => {
    return 10000;
  },
  showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
};

const connceted = () => {
  console.log('Redis connected. Connection port', options.port);
};
const error = err => {
  console.log('Redis connection error');
};

const pubsub = new RedisPubSub({
  connection: options,
});
pubsub.redisSubscriber.on('connect', connceted);
pubsub.redisSubscriber.on('error', error);
pubsub.redisPublisher.on('error', error);

export default pubsub;
