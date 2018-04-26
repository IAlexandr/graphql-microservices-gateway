const expresss = require('express');
const http = require('http');
const bodyParser = require('body-parser');
// import cors from 'cors';
const { graphqlExpress } = require('graphql-server-express');
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const expressPlayground = require('graphql-playground-middleware-express');
const cookieParser = require('cookie-parser');
const { express } = require('graphql-voyager/middleware');
const path = require('path');
const { mergeSchemas } = require('graphql-tools');
const { getIntrospectSchema } = require('./introspection');
const mainSchema = require('./schema');
const { Binding } = require('graphql-binding');
const pubsub = require('./pubsub');
const PORT = 3000;

const endpoints = [
  'http://localhost:3001/graphql',
  'http://localhost:3002/graphql',
];

const app = expresss();
console.log('expressPlayground', expressPlayground);
// app.use('*', cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser());

app.use('/voyager', express({ endpointUrl: '/graphql' }));

Promise.all(endpoints.map(ep => getIntrospectSchema(ep))).then(schemas => {
  const schemaBinding = new Binding({ schema: schemas[0] });

  pubsub.subscribe('USER_CHANGED', message => {
    console.log('message', message);
  });

  const schema = mergeSchemas({
    schemas: schemas.concat(mainSchema),
    resolvers: {
      Subscription: {
        userChanged: {
          resolve: (payload, args, context, info) => {
            console.log('resolve!!!!', payload);
            // Manipulate and return the new value
            return payload.userChanged;
          },
          subscribe: () => {
            console.log('subscribe USER_CHANGED');
            return pubsub.asyncIterator('USER_CHANGED');
          },
        },
      },
    },
  });
  app.use('/graphql', bodyParser.json(), (req, res, next) => {
    // debug('req.session.id:', req.session.id);
    return graphqlExpress({
      schema,
    })(req, res, next);
  });
  app.get(
    '/playground',
    expressPlayground.default({
      endpoint: '/graphql',
      subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
    })
  );

  const serverListening = () => {
    console.log(`GraphQL Server is now running on http://localhost:${PORT}`);
    const ss = new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
      },
      {
        server: ws,
        path: '/subscriptions',
      }
    );
  };

  const ws = http.Server(app);
  ws.listen(PORT, serverListening);
});
