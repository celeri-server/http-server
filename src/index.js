
import { Server } from './server';
import { createServerFromConfig } from './create-server';
import { RegexRouter } from '@celeri/router';

export { Server } from './server';

export const createServer = (config = { }) => {
	const Router = config.router || RegexRouter;
	const router = typeof Router === 'function' ? new Router() : Router;

	if (config.server) {
		return new Server(config.server, router);
	}

	const server = createServerFromConfig(config);
	return new Server(server, router);
};
