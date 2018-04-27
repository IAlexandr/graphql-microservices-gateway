import expresss from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import { graphqlExpress } from 'graphql-server-express';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import expressPlayground from 'graphql-playground-middleware-express';
import cookieParser from 'cookie-parser';
import { express } from 'graphql-voyager/middleware';
import path from 'path';
import { mergeSchemas } from 'graphql-tools';
import { getIntrospectSchema } from './introspection';
import mainSchema from './schema';

const PORT = 3000;

const endpoints = [
  {
    httpUrl: 'http://localhost:3001/graphql',
    wsUrl: 'ws://localhost:3001/subscriptions',
  },
  {
    httpUrl: 'http://localhost:3002/graphql',
    wsUrl: 'ws://localhost:3002/subscriptions',
  },
];

const app = expresss();
app.use(cookieParser());

app.use('/voyager', express({ endpointUrl: '/graphql' }));

Promise.all(endpoints.map(ep => getIntrospectSchema(ep))).then(schemas => {
  const schema = mergeSchemas({
    schemas: schemas.concat(mainSchema),
  });
  app.use('/graphql', bodyParser.json(), (req, res, next) => {
    return graphqlExpress({
      schema,
    })(req, res, next);
  });
  app.get(
    '/playground',
    expressPlayground({
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
