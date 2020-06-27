import { Request, Response } from 'express';
import { ApiError } from './apiError';
import { HttpResponseCode } from './httpResponseCode';
import { sendEmail } from '../mail';

const toEmails: string[] = ['admin@unicsmcr.com'];

/**
 * Handles errors thrown by requests
 */
export const errorHandler = (err: ApiError|Error, req: Request, res: Response) => {
	if (err instanceof Error) {
		if (process.env.ENVIRONMENT === 'production') {
			// Send notification to admins when an uncaught error occurs
			sendEmail('noreply@unicsmcr.com',
				toEmails,
				`Uncaught Error (Hacker Suite Hub): ${err.name}`,
				err.message + (err.stack ?? ''));
		}

		console.error(err.stack);
		res.status(HttpResponseCode.INTERNAL_ERROR).send(new ApiError(HttpResponseCode.INTERNAL_ERROR, err.stack));
	} else {
		res.status(err.statusCode).send(err);
	}
};

/**
 * Handles 404 errors
 */
export const error404Handler = (req: Request, res: Response) => {
	const apiError: ApiError = new ApiError(HttpResponseCode.NOT_FOUND);
	res.render('pages/404', { error: apiError });
};
