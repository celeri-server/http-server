
import { Server } from 'http';
import { ServerOptions } from 'https';
import { Router, Route } from '@celeri/router';
import { MiddlewareInput } from './index';

interface RouterConstructor {
	new (): Router<Route<MiddlewareInput>, MiddlewareInput>;
}

export interface Config {
	ssl?: ServerOptions,
	router?: RouterConstructor,
	server?: Server
}
