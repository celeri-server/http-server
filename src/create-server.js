
import http from 'http';
import https from 'https';

export const createServerFromConfig = (config) => {
	return config.ssl ? https.createServer(config.ssl) : http.createServer();
};
