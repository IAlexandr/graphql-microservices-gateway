const pubsub = require('./pubsub');
const { makeExecutableSchema } = require('graphql-tools');
const data = [
  { id: '1', name: 'СуперАдминистраторы' },
  { id: '2', name: 'Администраторы' },
  { id: '3', name: 'Пользователи' },
];

// SCHEMA DEFINITION
const typeDefs = `
type Query {
  groups: [Group]
  group(id: ID!): Group
}
type Subscription {
  groupChanged: Group!
}
type Mutation {
  change(id: ID!, name: String!): Group
}
type Group {
  id: ID!
  name: String
}`;

// RESOLVERS
const resolvers = {
  Query: {
    groups: (root, args, context, info) => data,
    group: (root, args, context, info) => {
      return data.find(item => item.id == args.id);
    },
  },
  Subscription: {
    groupChanged: {
      subscribe: () => {
        return pubsub.asyncIterator('GROUP_CHANGED');
      },
    },
  },
  Mutation: {
    change: (parent, { id, name }) => {
      const group = data.find(item => item.id == id);
      if (group) {
        group.name = name;
      }
      pubsub.publish('GROUP_CHANGED', {
        groupChanged: group,
      });
      return group;
    },
  },
};

// (EXECUTABLE) SCHEMA
module.exports = makeExecutableSchema({
  typeDefs,
  resolvers,
});
