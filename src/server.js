
import { parse as parseUrl } from 'url';
import { Router } from '@celeri/router';
import { MiddlewarePipeline } from '@celeri/middleware-pipeline';

const props = new WeakMap();

export class Server {
	constructor(server) {
		props.set(this, {
			server: server,
			router: new Router(),
			pipeline: new MiddlewarePipeline()
		});

		server.on('request', (req, res) => this.onRequest(req, res));
	}

	get server() {
		return props.get(this).server;
	}

	use(middleware) {
		props.get(this).pipeline.use(middleware);
	}

	catch(middleware) {
		props.get(this).pipeline.catch(middleware);
	}

	get(route) {
		return props.get(this).router.createRoute('get', route);
	}

	head(route) {
		return props.get(this).router.createRoute('head', route);
	}

	post(route) {
		return props.get(this).router.createRoute('post', route);
	}

	put(route) {
		return props.get(this).router.createRoute('put', route);
	}

	patch(route) {
		return props.get(this).router.createRoute('patch', route);
	}

	delete(route) {
		return props.get(this).router.createRoute('delete', route);
	}

	options(route) {
		return props.get(this).router.createRoute('options', route);
	}

	router({ notFound }) {
		return async ({ req, res }) => {
			const { router } = props.get(this);
			const { pathname } = parseUrl(req.url);
			const match = router.find(req.method, pathname);

			if (! match) {
				return await notFound({ req, res });
			}

			req.params = match.params;
			req.glob = match.glob;

			await match.route.run({ req, res });
		};
	}

	onRequest(req, res) {
		const { pipeline } = props.get(this);
		pipeline.run({ req, res });
	}
}
