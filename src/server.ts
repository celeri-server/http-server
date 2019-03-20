
import { parse as parseUrl } from 'url';
import { Server as HttpServer, IncomingMessage, ServerResponse } from 'http';
import { Router, RouterMiddwareInput } from '@celeri/router';
import { MiddlewarePipeline, MiddlewareFunction, ErrorMiddlewareFunction } from '@celeri/middleware-pipeline';

interface PrivateStorage {
	server: HttpServer,
	router: Router<any>,
	pipeline: MiddlewarePipeline<MiddlewareInput>
}

export interface RouterOptions {
	notFound: MiddlewareFunction<MiddlewareInput>
}

export interface Request extends IncomingMessage {
	pathname?: string,
	query?: string,
	params?: {
		[param: string]: string
	},
	glob?: string
}

export interface Response extends ServerResponse {
	// 
}

export interface MiddlewareInput extends RouterMiddwareInput {
	req: Request,
	res: Response
}

const props: WeakMap<Server, PrivateStorage> = new WeakMap();

export class Server {
	constructor(server: HttpServer, router: Router<any>) {
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

	use(middleware: MiddlewareFunction<MiddlewareInput>) {
		props.get(this).pipeline.use(middleware);
		return this;
	}

	catch(middleware: ErrorMiddlewareFunction<MiddlewareInput>) {
		props.get(this).pipeline.catch(middleware);
		return this;
	}

	route(method: string, route: string) {
		return props.get(this).router.createRoute(method, route);
	}

	get(route: string) {
		return props.get(this).router.createRoute('get', route);
	}

	head(route: string) {
		return props.get(this).router.createRoute('head', route);
	}

	post(route: string) {
		return props.get(this).router.createRoute('post', route);
	}

	put(route: string) {
		return props.get(this).router.createRoute('put', route);
	}

	patch(route: string) {
		return props.get(this).router.createRoute('patch', route);
	}

	delete(route: string) {
		return props.get(this).router.createRoute('delete', route);
	}

	options(route: string) {
		return props.get(this).router.createRoute('options', route);
	}

	router(options: RouterOptions) {
		const { notFound } = options;

		return async ({ req, res }: MiddlewareInput) => {
			const { router } = props.get(this);
			const { pathname, query } = parseUrl(req.url);
			
			req.pathname = pathname;
			req.query = query;

			const match = router.find(req.method, pathname);

			if (! match) {
				if (notFound) {
					await notFound({ req, res });
				}

				return ;
			}

			req.params = match.params;
			req.glob = match.glob;

			await match.route.run({ req, res });
		};
	}

	onRequest(req: Request, res: Response) {
		const { pipeline } = props.get(this);

		pipeline.run({ req, res });
	}
}
