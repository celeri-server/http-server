
import { Server as HttpServer } from 'http';
import { MiddlewareInput, Request, Response, Server } from './server';
import { RouterConstructor } from './config';
import { Router, RouterMiddwareInput } from '@celeri/router';
import { ErrorMiddlewareFunction, MiddlewareFunction, MiddlewarePipeline } from '@celeri/middleware-pipeline';

type AnyInput = MiddlewareInput<any, any>;

export interface MultiHostRouterOptions {
	notFound?: MiddlewareFunction<AnyInput>;
}

export class MultiHostServer {
	protected readonly _router: MultiHostRouter<AnyInput>;
	protected readonly _pipeline: MiddlewarePipeline<any>;
	
	constructor(
		protected readonly _server: HttpServer,
		protected readonly _Router: RouterConstructor
	) {
		this._router = new MultiHostRouter();
		this._pipeline = new MiddlewarePipeline();
		this._listen();
	}
	
	protected _listen() {
		this._server.on('request', (req, res) => this.onRequest(req, res));
	}

	/**
	 * Registers a middleware function in the top-level middleware pipeline.
	 * Any middlewares registered here will run for every incoming request.
	 *
	 * @template P Any URL params that will be parsed out by the router (should only be used
	 *   on middlewares registered after the router)
	 * @template Req Any additional extensions that will exist on the request object, useful
 	 *   for registering the result of a body parser, query string parser, etc.
	 */
	use<P = void, Req = void>(middleware: MiddlewareFunction<MiddlewareInput<P, Req>>) {
		this._pipeline.use(middleware);

		return this;
	}

	/**
	 * Registers an error middleware function in the top-level middleware pipeline.
	 *
	 * @template P Any URL params that will be parsed out by the router (should only be used
	 *   on middlewares registered after the router)
	 * @template Req Any additional extensions that will exist on the request object, useful
 	 *   for registering the result of a body parser, query string parser, etc.
	 */
	catch<P = any, Req = void>(middleware: ErrorMiddlewareFunction<MiddlewareInput<P, Req>>) {
		this._pipeline.catch(middleware);

		return this;
	}

	/**
	 * Registers an endpoint on the router for the given hostname pattern.
	 *
	 * @param method The HTTP method to catch requests for
	 * @param route The endpoint route pattern to listen for
	 * @template P Any URL params that will be parsed out by the router (should only be used
	 *   on middlewares registered after the router)
	 * @template Req Any additional extensions that will exist on the request object, useful
 	 *   for registering the result of a body parser, query string parser, etc.
	 */
	host<P = void, Req = void>(hostname: string) : MultiHostServerRoute<MiddlewareInput<P, Req>> {
		return this._router.createRoute(this._server, new this._Router(), hostname);
	}

	/**
	 * Returns a middleware function that passes the request through the registered router.
	 * This should be registered as a top-level middleware at the point in the main pipeline
	 * when you want endpoints to run.
	 *
	 * ```typescript
	 * const options = {
	 *   // ...
	 * };
	 *
	 * server.use(server.router(options));
	 * ```
	 *
	 * @param options The options used when generating the router endpoint
	 */
	router(options: MultiHostRouterOptions) {
		const { notFound } = options;

		return async ({ req, res }: AnyInput) => {
			const hostname = req.headers['host'];

			if (! hostname) {
				if (notFound) {
					await notFound({ req, res });
				}

				return;
			}

			req.host = hostname;

			const match = this._router.find(hostname);

			if (! match) {
				if (notFound) {
					await notFound({ req, res });
				}

				return;
			}

			await match._run(req, res);
		};
	}

	/**
	 * The method registered to the HTTP server on('request') event. Simply passes
	 * the request and response objects into the top-level middleware pipeline.
	 */
	protected onRequest(req: Request<any>, res: Response) {
		// FIXME: If this function rejects, nothing can catch it.
		this._pipeline.run({ req, res });
	}
}

export class MultiHostRouter<I extends RouterMiddwareInput> {
	protected readonly _routes: MultiHostServerRoute<I>[];

	createRoute(server: HttpServer, router: Router<any, I>, hostname: string) : MultiHostServerRoute<I> {
		const route = new MultiHostServerRoute<I>(server, router, hostname);

		this._routes.push(route);

		return route;
	}

	find(hostname: string) {
		for (let i = 0; i < this._routes.length; i++) {
			const route = this._routes[i];

			if (route._matches(hostname)) {
				return route;
			}
		}
	}
}

export class MultiHostServerRoute<I extends RouterMiddwareInput> extends Server {
	protected readonly _pattern: RegExp;

	constructor(
		server: HttpServer,
		router: Router<any, I>,
		public readonly hostname: string
	) {
		super(server, router);

		this._pattern = parseHostname(hostname);
	}

	protected _listen() {
		// pass, but don't call super
	}

	_run(req: Request<I>, res: Response) {
		return this.onRequest(req, res);
	}

	_matches(hostname: string) {
		const match = this._pattern.exec(hostname);

		if (! match) {
			return null;
		}

		return true;
	}
}

const globPattern = /\*/g;
const globReplacement = '([^\.]+)';

const doubleGlobPattern = /\*\*/g;
const doubleGlobReplacement = '(.+)';

function parseHostname(hostname: string) {
	const pattern: string = hostname
		.replace(doubleGlobPattern, doubleGlobReplacement)
		.replace(globPattern, globReplacement);

	return new RegExp(`^${pattern}$`);
}
