import { RedisPubSub } from 'graphql-redis-subscriptions';
import debug from './debug';
const log = debug('pubsub');

const options = {
  port: 32768,
  retryStrategy: options => {
    return 10000;
  },
  showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
};

const connceted = () => {
  log('Redis connected. Connection port', options.port);
};
const error = err => {
  log('Redis connection error');
};

const pubsub = new RedisPubSub({
  connection: options,
});
pubsub.redisSubscriber.on('connect', connceted);
pubsub.redisSubscriber.on('error', error);
pubsub.redisPublisher.on('error', error);

export default pubsub;
