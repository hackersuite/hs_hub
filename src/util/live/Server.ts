import { injectable } from "inversify";

export interface LivePacket {
    event: string,
    data: Object,
}

export interface LiveServerInterface {
    attachServer: (server: SocketIO.Server) => void;
    broadcast: (data: LivePacket) => void;
}

/**
 * Manages a collection of subscribers, automatically removing them once disconnected.
 */
@injectable()
export class LiveServer implements LiveServerInterface {

    private _socketIO: SocketIO.Server;
    private _nsp: SocketIO.Namespace;

    constructor() {}

    public attachServer(server: SocketIO.Server) {
        if (this._socketIO) return;
        this._socketIO = server;
        this._nsp = server.of("/hardware/live");
        console.log("  Attached socket.io server!");
    }

    public broadcast(packet: LivePacket) {
        const { event, data } = packet;
        this._nsp.emit(event, data);
    }
}
