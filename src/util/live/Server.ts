import { injectable, inject } from "inversify";
import * as request from "request-promise-native";
import { TYPES } from "../../types";
import { HardwareService } from "../../services/hardware";

export interface LivePacket {
    event: string,
    data: Object,
}

export interface LiveServerInterface {
    attachServer: (server: SocketIO.Server) => void;
    broadcast: (data: LivePacket) => void;
    setHardwareService: (hardwareService: HardwareService) => void;
}

/**
 * Manages a collection of subscribers, automatically removing them once disconnected.
 */
@injectable()
export class LiveServer implements LiveServerInterface {

    private _socketIO: SocketIO.Server;
    private _nsp: SocketIO.Namespace;
    private _hardwareService: HardwareService;

    public setHardwareService(hardwareService: HardwareService) {
        this._hardwareService = hardwareService;
    }

    public attachServer(server: SocketIO.Server) {
        if (this._socketIO) return;
        this._socketIO = server;
        this._nsp = server.of("/hardware/live");
        this._nsp.on("connect", async socket => {
            if (!socket.handshake.headers || typeof socket.handshake.headers.cookie !== "string") {
                socket.disconnect();
                return;
            }
            const token = socket.handshake.headers.cookie.match(/Authorization=([a-zA-Z\.\d_]+)/)[1];
            try {
                let apiResult = JSON.parse(await request.get(`${process.env.AUTH_URL}/api/v1/users/me`, {
                    headers: {
                        Authorization: token
                    }
                }));

                let userID = apiResult.user._id;

                const data = await this._hardwareService.generateHardwareItemsOverview(userID);

                socket.emit("sync", data);
            } catch (err) {
                // console.log(err);
            }
        });
        console.log("  Attached socket.io server!");
    }

    public broadcast(packet: LivePacket) {
        const { event, data } = packet;
        this._nsp.emit(event, data);
    }
}
