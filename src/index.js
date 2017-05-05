
import { Server } from './server';
import { createServerFromConfig } from './create-server';

export { Server } from './server';

export const createServer = (configOrServer = { }, callback) => {
	const isServer = typeof configOrServer.on === 'function' && typeof configOrServer.listen === 'function';
	const server = isServer ? configOrServer : createServerFromConfig(configOrServer, callback);
	return new Server(server);
};
