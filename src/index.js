
export { Server } from './server';
import { createServerFromConfig } from './create-server';

export const createServer = (configOrServer = { }) => {
	const isServer = typeof configOrServer.on === 'function' && typeof configOrServer.listen === 'function';
	const server = isServer ? configOrServer : createServerFromConfig(configOrServer);
	return new Server(server);
};
