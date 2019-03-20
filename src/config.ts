
import { ServerOptions } from 'https';
import { Router } from '@celeri/router';
import { Server } from 'http';

interface RouterConstructor {
	new (): Router<any>;
}

export interface Config {
	ssl?: ServerOptions,
	router?: RouterConstructor,
	server?: Server
}
