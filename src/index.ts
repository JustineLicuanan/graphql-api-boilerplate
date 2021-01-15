import 'reflect-metadata';
import { createConnection, getConnectionOptions } from 'typeorm';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';

import { HelloWorldResolver } from './resolvers/HelloWorldResolver';

(async () => {
	const { NODE_ENV = 'development', PORT = '4000' } = process.env;
	const app = express();

	const options = await getConnectionOptions(NODE_ENV);
	await createConnection({ ...options, name: 'default' });

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloWorldResolver],
			validate: true,
		}),
		context: ({ req, res }) => ({ req, res }),
	});

	apolloServer.applyMiddleware({ app, cors: false });
	app.listen(PORT, () =>
		console.log(`Server started at http://localhost:${PORT}/graphql`)
	);
})();
