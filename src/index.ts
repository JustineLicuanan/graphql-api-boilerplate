import 'reflect-metadata';
import { createConnection, getConnectionOptions } from 'typeorm';
import express from 'express';
import session from 'express-session';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';

import { AuthResolver } from './resolvers/AuthResolver';
import { BookResolver } from './resolvers/BookResolver';

(async () => {
	const {
		NODE_ENV = 'development',
		PORT = '4000',
		SESSION_SECRET = 'aslkdfjoiq12312',
	} = process.env;
	const app = express();

	app.use(
		session({
			name: 'qid',
			secret: SESSION_SECRET,
			resave: false,
			saveUninitialized: false,
			cookie: {
				httpOnly: true,
				secure: NODE_ENV === 'production',
				maxAge: 1000 * 60 * 60 * 24 * 7 * 365, // 7 years
			},
		})
	);

	// Get options from ormconfig.js
	const dbOptions = await getConnectionOptions(NODE_ENV);
	await createConnection({ ...dbOptions, name: 'default' });

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [AuthResolver, BookResolver],
			validate: true,
		}),
		context: ({ req, res }) => ({ req, res }),
		playground: {
			settings: {
				'request.credentials': 'include',
			},
		},
	});

	apolloServer.applyMiddleware({ app, cors: false });
	app.listen(PORT, () =>
		console.log(`Server started at http://localhost:${PORT}/graphql`)
	);
})();
