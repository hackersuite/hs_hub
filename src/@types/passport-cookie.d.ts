declare module 'passport-cookie' {
	import passport from 'passport';
	export default class CookieStrategy implements passport.Strategy {
		public name?: string;
		public authenticate(this: StrategyCreated<this>, req: express.Request, options?: any): any;
		public constructor (options: function|Record<string, any>, deserializeUser: function);
	}
}
