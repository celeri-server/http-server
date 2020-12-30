
import { Server } from 'http';
import { ServerOptions } from 'https';
import { Router, Route } from '@celeri/router';
import { MiddlewareInput } from './index';

export interface RouterConstructor {
	new (): Router<Route<MiddlewareInput<any>>, MiddlewareInput<any>>;
}

export interface Config {
	ssl?: ServerOptions,
	router?: RouterConstructor,
	server?: Server
}
