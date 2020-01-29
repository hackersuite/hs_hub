import { Request, Response } from "express";
import { EventEmitter } from "events";

export interface ISubscriberMessage {
    event?: String,
    data: Object | string,
    id?: String,
    retry?: Number,
}

/**
 * Represents a subscriber to Server-Side Events, i.e. a connection to an SSE endpoint.
 * It will emit `close` once the connection dies.
 */
export class Subscriber extends EventEmitter {
    private _req: Request;
    private _res: Response;

    constructor(req: Request, res: Response) {
        super();
        this._req = req;
        this._res = res;

        // Set the headers required for SSE
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        // Forward the close event from _req to Subscriber
        this._req.on("close", (...args) => this.emit("close", ...args));
    }

    /**
     * Sends a SubscriberMessage to the subscriber, or a string (sent as is.)
     * @param data the data to send
     */
    public send(data: ISubscriberMessage | string) {
        if (typeof data === 'string') {
            this._res.write(data);
        } else {
            this._res.write(Subscriber.serialiseMessage(data));
        }
    }

    /**
     * Creates a packet that can be sent to a subscriber.
     * @param data The data to serialise, must be JSON-serialisable.
     */
    public static serialiseMessage(message: ISubscriberMessage) {
        let output = [];
        if (message.event) output.push(`event: ${message.event}`);
        if (message.data) {
            if (typeof message.data === "string") {
                output.push(`data: ${message.data}`);
            } else {
                output.push(`data: ${JSON.stringify(message.data)}`);
            }
        }
        if (message.id) output.push(`id: ${message.id}`);
        if (typeof message.retry === "number") output.push(`retry: ${message.retry}`);
        return output.join("\n") + "\n\n";
    }
}
