const { RedisPubSub } = require('graphql-redis-subscriptions');

const pubsub = new RedisPubSub({
  connection: { port: 32768 },
});
console.log('redis connection port ', 32768);

module.exports = pubsub;
