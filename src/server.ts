
import { parse as parseUrl } from 'url';
import { Server as HttpServer, IncomingMessage, ServerResponse } from 'http';
import { Route, Router, RouterMiddwareInput } from '@celeri/router';
import { MiddlewarePipeline, MiddlewareFunction, ErrorMiddlewareFunction } from '@celeri/middleware-pipeline';

export interface RouterOptions {
	notFound: MiddlewareFunction<MiddlewareInput<any>>;
}

/**
 * Represents an incoming HTTP request on the server; An extension of the built-in
 * `IncomingMessage` type
 *
 * @template P Any URL params that will be parsed out by the router
 */
export interface Request<P = void> extends IncomingMessage {
	pathname?: string;
	querystring?: string;
	params?: P;
	glob?: string;
	host?: string;
}

/**
 * Represents an outgoing response to an HTTP request; An extension of the built-in
 * `ServerResponse` type.
 */
export interface Response extends ServerResponse {
	// 
}

/**
 * The input parameter for a server middleware function
 *
 * @template P Any URL params that will be parsed out by the router
 * @template Req Any additional extensions that will exist on the request object, useful
 *   for registering the result of a body parser, query string parser, etc.
 */
export interface MiddlewareInput<P, Req = void> extends RouterMiddwareInput {
	req: Request<P> & Req,
	res: Response
}

type AnyInput = MiddlewareInput<any, any>;
type AnyRouter = Router<Route<AnyInput>, AnyInput>;

/**
 * An HTTP server with a built-in middleware pipeline and router
 */
export class Server {
	protected readonly _router: AnyRouter;
	protected readonly _pipeline: MiddlewarePipeline<any>;

	/**
	 * @param server The underlying HTTP server to listen for requests on
	 * @param router The underlying router to use
	 */
	constructor(public readonly server: HttpServer, router: AnyRouter) {
		this._router = router;
		this._pipeline = new MiddlewarePipeline();
		this._listen();
	}

	protected _listen() {
		this.server.on('request', (req, res) => this.onRequest(req, res));
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
	 * Registers an endpoint on the router.
	 *
	 * @param method The HTTP method to catch requests for
	 * @param route The endpoint route pattern to listen for
	 * @template P Any URL params that will be parsed out by the router (should only be used
	 *   on middlewares registered after the router)
	 * @template Req Any additional extensions that will exist on the request object, useful
 	 *   for registering the result of a body parser, query string parser, etc.
	 */
	route<P = void, Req = void>(method: string, route: string) : Route<MiddlewareInput<P, Req>> {
		return this._router.createRoute(method, route);
	}

	/**
	 * Registers a GET endpoint on the router.
	 *
	 * @param route The endpoint route pattern to listen for
	 * @template P Any URL params that will be parsed out by the router (should only be used
	 *   on middlewares registered after the router)
	 * @template Req Any additional extensions that will exist on the request object, useful
 	 *   for registering the result of a body parser, query string parser, etc.
	 */
	get<P = void, Req = void>(route: string) : Route<MiddlewareInput<P, Req>> {
		return this._router.createRoute('get', route);
	}

	/**
	 * Registers a HEAD endpoint on the router.
	 *
	 * @param route The endpoint route pattern to listen for
	 * @template P Any URL params that will be parsed out by the router (should only be used
	 *   on middlewares registered after the router)
	 * @template Req Any additional extensions that will exist on the request object, useful
 	 *   for registering the result of a body parser, query string parser, etc.
	 */
	head<P = void, Req = void>(route: string) : Route<MiddlewareInput<P, Req>> {
		return this._router.createRoute('head', route);
	}

	/**
	 * Registers a POST endpoint on the router.
	 *
	 * @param route The endpoint route pattern to listen for
	 * @template P Any URL params that will be parsed out by the router (should only be used
	 *   on middlewares registered after the router)
	 * @template Req Any additional extensions that will exist on the request object, useful
 	 *   for registering the result of a body parser, query string parser, etc.
	 */
	post<P = void, Req = void>(route: string) : Route<MiddlewareInput<P, Req>> {
		return this._router.createRoute('post', route);
	}

	/**
	 * Registers a PUT endpoint on the router.
	 *
	 * @param route The endpoint route pattern to listen for
	 * @template P Any URL params that will be parsed out by the router (should only be used
	 *   on middlewares registered after the router)
	 * @template Req Any additional extensions that will exist on the request object, useful
 	 *   for registering the result of a body parser, query string parser, etc.
	 */
	put<P = void, Req = void>(route: string) : Route<MiddlewareInput<P, Req>> {
		return this._router.createRoute('put', route);
	}

	/**
	 * Registers a PATCH endpoint on the router.
	 *
	 * @param route The endpoint route pattern to listen for
	 * @template P Any URL params that will be parsed out by the router (should only be used
	 *   on middlewares registered after the router)
	 * @template Req Any additional extensions that will exist on the request object, useful
 	 *   for registering the result of a body parser, query string parser, etc.
	 */
	patch<P = void, Req = void>(route: string) : Route<MiddlewareInput<P, Req>> {
		return this._router.createRoute('patch', route);
	}

	/**
	 * Registers a DELETE endpoint on the router.
	 *
	 * @param route The endpoint route pattern to listen for
	 * @template P Any URL params that will be parsed out by the router (should only be used
	 *   on middlewares registered after the router)
	 * @template Req Any additional extensions that will exist on the request object, useful
 	 *   for registering the result of a body parser, query string parser, etc.
	 */
	delete<P = void, Req = void>(route: string) : Route<MiddlewareInput<P, Req>> {
		return this._router.createRoute('delete', route);
	}

	/**
	 * Registers a OPTIONS endpoint on the router.
	 *
	 * @param route The endpoint route pattern to listen for
	 * @template P Any URL params that will be parsed out by the router (should only be used
	 *   on middlewares registered after the router)
	 * @template Req Any additional extensions that will exist on the request object, useful
 	 *   for registering the result of a body parser, query string parser, etc.
	 */
	options<P = void, Req = void>(route: string) : Route<MiddlewareInput<P, Req>> {
		return this._router.createRoute('options', route);
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
	router(options: RouterOptions) {
		const { notFound } = options;

		return async ({ req, res }: AnyInput) => {
			const { pathname, query } = parseUrl(req.url);
			
			req.pathname = pathname;
			req.querystring = query;

			const match = this._router.find(req.method, pathname);

			if (! match) {
				if (notFound) {
					await notFound({ req, res });
				}

				return;
			}

			req.params = match.params;
			req.glob = match.glob;

			await match.route.run({ req, res });
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
