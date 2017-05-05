
import http from 'http';
import https from 'https';

export const createServerFromConfig = (config) => {
	const server = config.ssl ? https.createServer(config.ssl) : http.createServer();
	server.listen(config.port || 8080, config.address || '0.0.0.0');
	return server;
};
