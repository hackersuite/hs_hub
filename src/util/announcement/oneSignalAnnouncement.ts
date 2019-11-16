import { User } from "../../db/entity";

interface OneSignalData {
  app_id: string;
  contents: Object;
  headings: Object;
  included_segments?: string[];
  include_player_ids?: Object;
}

export async function sendPushNotificationByUserID(text: string, ...onlyTheseUsers: User[]): Promise<Object> {
  const userPushIds: string[] = [];
  onlyTheseUsers.forEach((user: User) => {
    if (user.push_id !== undefined) {
      user.push_id.forEach(token => {
        userPushIds.push(token);
      });
    }
  });
  const response: Object = await sendOneSignalNotification(text, userPushIds);
  if (response.hasOwnProperty("errors") === false)
    return response;
  else
    return `Failed to send the push notification!. ${JSON.stringify(response)}`;
}

export function sendOneSignalNotification(text: string, onlyThesePushIds?: string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const headers: Object = {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Basic ${process.env.ONE_SIGNAL_REST_API_KEY}`
    };

    const options: Object = {
      host: "onesignal.com",
      port: 443,
      path: "/api/v1/notifications",
      method: "POST",
      headers: headers
    };

    const https: any = require("https");
    const req: any = https.request(options, (res: any) => {
      res.on("data", (result: string) => {
        resolve(JSON.parse(result));
      });
    });

    req.on("error", (err: Error) => {
      reject(err);
    });

    const message: OneSignalData = {
      app_id: process.env.ONE_SIGNAL_API_KEY,
      contents: {"en": text},
      headings: {"en": process.env.ONE_SIGNAL_NOTIFICATION_HEADING}
    };

    if (onlyThesePushIds === undefined) {
      message.included_segments = [process.env.ONE_SIGNAL_USER_SEGMENTS];
    } else {
      message.include_player_ids = onlyThesePushIds;
    }

    req.write(JSON.stringify(message));
    req.end();
  });
}