
import { Server } from './server';
import { createServerFromConfig } from './create-server';
import { RegexRouter } from '@celeri/router';
import { Config } from './config';
import { MultiHostServer } from './multi-host';

export { Server, RouterOptions, Request, Response, MiddlewareInput } from './server';
export { MultiHostServer, MultiHostRouter, MultiHostRouterOptions, MultiHostServerRoute } from './multi-host';

export const createServer = (config: Config = { }) => {
	const Router = config.router || RegexRouter;
	const router = typeof Router === 'function' ? new Router() : Router;

	if (config.server) {
		return new Server(config.server, router);
	}

	const server = createServerFromConfig(config);
	
	return new Server(server, router);
};

export const createMultiHostServer = (config: Config = { }) => {
	const Router = config.router || RegexRouter;
	
	if (config.server) {
		return new MultiHostServer(config.server, Router);
	}

	const server = createServerFromConfig(config);

	return new MultiHostServer(server, Router);
};
