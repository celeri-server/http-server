
import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { Config } from './config';

export const createServerFromConfig = (config: Config) => {
	return config.ssl ? createHttpsServer(config.ssl) : createHttpServer();
};
