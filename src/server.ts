import { buildApp } from './app';

/**
 * Start Express server.
 */

buildApp()
	.then(app => {
		app.listen(app.get('port'), () => {
			console.log(
				'  App is running at http://localhost:%d in %s mode',
				app.get('port'),
				app.get('env')
			);
			console.log('  Press CTRL-C to stop\n');
		});
	})
	.catch(console.error);
