export function sendOneSignalNotification(text: string): Promise<any> {
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

    const message: Object = {
      app_id: process.env.ONE_SIGNAL_API_KEY,
      contents: {"en": text},
      included_segments: ["All"]
    };

    req.write(JSON.stringify(message));
    req.end();
  });
}