import { User } from '../../db/entity';
import https from 'https';

interface OneSignalData {
	app_id: string;
	contents: Record<string, any>;
	headings: Record<string, any>;
	included_segments?: string[];
	include_player_ids?: Record<string, any>;
}

export async function sendPushNotificationByUserID(text: string, ...onlyTheseUsers: User[]): Promise<Record<string, any>> {
	const userPushIds: string[] = [];
	onlyTheseUsers.forEach((user: User) => {
		if (user.push_id) {
			user.push_id.forEach(token => {
				userPushIds.push(token);
			});
		}
	});
	const response = await sendOneSignalNotification(text, userPushIds);
	if (!response.hasOwnProperty('errors')) { return response; }
	throw new Error(`Failed to send the push notification!. ${JSON.stringify(response)}`);
}

export function sendOneSignalNotification(text: string, onlyThesePushIds?: string[]): Promise<any> {
	return new Promise((resolve, reject) => {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json; charset=utf-8',
			'Authorization': `Basic ${process.env.ONE_SIGNAL_REST_API_KEY ?? ''}`
		};

		const options: Record<string, any> = {
			host: 'onesignal.com',
			port: 443,
			path: '/api/v1/notifications',
			method: 'POST',
			headers: headers
		};

		const req: any = https.request(options, (res: any) => {
			res.on('data', (result: string) => {
				resolve(JSON.parse(result));
			});
		});

		req.on('error', (err: Error) => {
			reject(err);
		});

		const message: OneSignalData = {
			app_id: process.env.ONE_SIGNAL_API_KEY ?? '',
			contents: { en: text },
			headings: { en: process.env.ONE_SIGNAL_NOTIFICATION_HEADING }
		};

		if (onlyThesePushIds === undefined) {
			message.included_segments = [process.env.ONE_SIGNAL_USER_SEGMENTS ?? ''];
		} else {
			message.include_player_ids = onlyThesePushIds;
		}

		req.write(JSON.stringify(message));
		req.end();
	});
}
