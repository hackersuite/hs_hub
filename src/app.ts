import 'reflect-metadata';

import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config({ path: '.env' });

import path from 'path';
import morgan from 'morgan';
import expressSession from 'express-session';
import cookieParser from 'cookie-parser';
import express, { Express, Request, Response, NextFunction } from 'express';
import { createConnections, ConnectionOptions } from 'typeorm';
import { errorHandler, error404Handler } from './util/errorHandling';
import { RouterInterface } from './routes';
import { TYPES } from './types';
import container from './inversify.config';
import { RequestAuthenticationV2 } from './util/auth';

export async function buildApp(connectionOptions?: ConnectionOptions[]): Promise<Express> {
	const app: Express = expressSetup();

	middlewareSetup(app);

	if (app.get('env') === 'dev') {
		devMiddlewareSetup(app);
	}

	// Connecting to database
	const databaseConnectionSettings: ConnectionOptions[] = connectionOptions
		? connectionOptions
		: createDatabaseSettings();

	const connections = await createConnections(databaseConnectionSettings);
	connections.forEach(element => {
		console.log(`  Connection to database (${element.name}) established.`);
	});

	// Set up passport for authentication
	// Also add the logout route
	const requestAuth: RequestAuthenticationV2 = container.get(TYPES.RequestAuthenticationV2);
	requestAuth.passportSetup(app);

	// Routes set up for express, resolving dependencies
	// This is performed after successful DB connection since some routers use TypeORM repositories in their DI
	const routers: RouterInterface[] = container.getAll(TYPES.Router);
	routers.forEach(router => {
		app.use(router.getPathRoot(), router.register());
	});

	// Setting up error handlers
	app.use(error404Handler);
	app.use(errorHandler);

	return app;
}

/**
 * Creates an Express app
 */
const expressSetup = (): Express => {
	// Create Express server
	const app = express();

	// view engine setup
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'ejs');

	// Express configuration
	app.set('port', process.env.PORT ?? 3000);
	app.set('env', process.env.ENVIRONMENT ?? 'production');
	if (process.env.ENVIRONMENT === 'production') {
		app.set('trust proxy', 1);
	}

	return app;
};

/**
 * Sets up middleware used by the app
 * @param app The app to set up the middleware for
 */
const middlewareSetup = (app: Express): void => {
	app.use((req, res, next) => {
		if (req.get('X-Forwarded-Proto') !== 'https' && process.env.USE_SSL) {
			res.redirect(`https://${req.headers.host ?? ''}${req.url}`);
		} else {
			return next();
		}
	});

	app.use(
		express.static(path.join(__dirname, 'public'),
			{ maxAge: 31557600000 })
	);

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(cookieParser());
	app.use(expressSession(getSessionOptions(app)));
};

/**
 * Sets up middleware used on development environments
 * @param app The app to set up the middleware for
 */
const devMiddlewareSetup = (app: Express): void => {
	// Development environment set up

	// Request logging
	app.use(morgan('dev'));
	// Disable browser caching
	app.use((req: Request, res: Response, next: NextFunction) => {
		res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
		res.header('Expires', '-1');
		res.header('Pragma', 'no-cache');
		next();
	});
};

/**
 * Creates the passport middleware for handling user authentication
 * @param app The app to set up the middleware for
 */
// const passportSetup = (app: Express, userService: UserService): void => {
//   // Passport configuration
//   app.use(passport.initialize());
//   app.use(passport.session());
//   // passport.use(passportLocalStrategy(userService));
// };

const getSessionOptions = (app: Express): any => ({
	saveUninitialized: true, // Saved new sessions
	resave: false, // Do not automatically write to the session store
	secret: process.env.SESSION_SECRET,
	cookie: { // Configure when sessions expires
		secure: (app.get('env') === 'dev' ? false : true),
		maxAge: 2419200000
	}
});

const createDatabaseSettings = (): ConnectionOptions[] => [{
	name: 'hub',
	type: 'mysql',
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	entities: [
		`${__dirname}/db/entity/*{.js,.ts}`
	],
	synchronize: true
	// If we want full query logging, uncomment the line below, and set logging = true
	// logger: new QueryLogger()
}];
