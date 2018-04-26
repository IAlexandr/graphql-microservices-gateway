const fetch = require('node-fetch');
const {
  makeRemoteExecutableSchema,
  introspectSchema,
} = require('graphql-tools');
const { split } = require('apollo-link');
const { createHttpLink, HttpLink } = require('apollo-link-http');
const { WebSocketLink } = require('apollo-link-ws');
const { SubscriptionClient } = require('subscriptions-transport-ws');
const { getMainDefinition } = require('apollo-utilities');
const ws = require('ws');

module.exports = {
  getIntrospectSchema: async ds => {
    const httpLink = createHttpLink({
      uri: ds.httpUrl,
      fetch,
    });
    const client = new SubscriptionClient(
      ds.wsUrl,
      {
        reconnect: true,
      },
      ws
    );
    const wsLink = new WebSocketLink(client);
    const link = split(
      // split based on operation type
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return (
          kind === 'OperationDefinition' && operation === 'subscription'
        );
      },
      wsLink,
      httpLink
    );

    const schema = await introspectSchema(httpLink);
    return makeRemoteExecutableSchema({
      schema,
      link,
    });
  },
};
