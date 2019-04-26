
import { parse as parseUrl } from 'url';
import { Server as HttpServer, IncomingMessage, ServerResponse } from 'http';
import { Route, Router, RouterMiddwareInput } from '@celeri/router';
import { MiddlewarePipeline, MiddlewareFunction, ErrorMiddlewareFunction } from '@celeri/middleware-pipeline';

interface PrivateStorage {
	server: HttpServer,
	router: Router<Route<MiddlewareInput<any>>, MiddlewareInput<any>>,
	pipeline: MiddlewarePipeline<MiddlewareInput<any>>
}

export interface RouterOptions {
	notFound: MiddlewareFunction<MiddlewareInput<any>>
}

export interface Request<P> extends IncomingMessage {
	pathname?: string;
	querystring?: string;
	params?: P;
	glob?: string;
}

export interface Response extends ServerResponse {
	// 
}

export interface MiddlewareInput<P> extends RouterMiddwareInput {
	req: Request<P>,
	res: Response
}

const props: WeakMap<Server, PrivateStorage> = new WeakMap();

export class Server {
	constructor(server: HttpServer, router: Router<Route<MiddlewareInput<any>>, MiddlewareInput<any>>) {
		props.set(this, {
			server: server,
			router: router,
			pipeline: new MiddlewarePipeline()
		});

		server.on('request', (req, res) => this.onRequest(req, res));
	}

	get server() {
		return props.get(this).server;
	}

	use<P = void>(middleware: MiddlewareFunction<MiddlewareInput<P>>) {
		props.get(this).pipeline.use(middleware);

		return this;
	}

	catch<P = void>(middleware: ErrorMiddlewareFunction<MiddlewareInput<P>>) {
		props.get(this).pipeline.catch(middleware);

		return this;
	}

	route<P = void>(method: string, route: string) : Route<MiddlewareInput<P>> {
		return props.get(this).router.createRoute(method, route);
	}

	get<P = void>(route: string) : Route<MiddlewareInput<P>> {
		return props.get(this).router.createRoute('get', route);
	}

	head<P = void>(route: string) : Route<MiddlewareInput<P>> {
		return props.get(this).router.createRoute('head', route);
	}

	post<P = void>(route: string) : Route<MiddlewareInput<P>> {
		return props.get(this).router.createRoute('post', route);
	}

	put<P = void>(route: string) : Route<MiddlewareInput<P>> {
		return props.get(this).router.createRoute('put', route);
	}

	patch<P = void>(route: string) : Route<MiddlewareInput<P>> {
		return props.get(this).router.createRoute('patch', route);
	}

	delete<P = void>(route: string) : Route<MiddlewareInput<P>> {
		return props.get(this).router.createRoute('delete', route);
	}

	options<P = void>(route: string) : Route<MiddlewareInput<P>> {
		return props.get(this).router.createRoute('options', route);
	}

	router(options: RouterOptions) {
		const { notFound } = options;

		return async ({ req, res }: MiddlewareInput<any>) => {
			const { router } = props.get(this);
			const { pathname, query } = parseUrl(req.url);
			
			req.pathname = pathname;
			req.querystring = query;

			const match = router.find(req.method, pathname);

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

	onRequest(req: Request<any>, res: Response) {
		const { pipeline } = props.get(this);

		pipeline.run({ req, res });
	}
}
