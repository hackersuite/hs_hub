import { injectable } from "inversify";

export interface LiveServerInterface {
    attachServer: (server: SocketIO.Server) => void;
    // addSubscriber: (subscriber: Subscriber) => void;
    // broadcast: (data: ISubscriberMessage | string) => void;
}

/**
 * Manages a collection of subscribers, automatically removing them once disconnected.
 */
@injectable()
export class LiveServer implements LiveServerInterface {

    private _socketIO: SocketIO.Server;

    constructor() {}

    public attachServer(server: SocketIO.Server) {
        if (this._socketIO) return;
        this._socketIO = server;
        console.log("attached!");
    }

    public broadcast(data: Object) {

    }
}
