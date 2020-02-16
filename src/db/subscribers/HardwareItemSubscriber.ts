import { EventSubscriber, EntitySubscriberInterface, UpdateEvent, InsertEvent } from "typeorm";
import { HardwareItem } from "../../db/entity";
import { LiveServer } from "../../util/live/Server";
import { TYPES } from "../../types";
import container from "../../inversify.config";
import { ILiveHardwareItem } from "../../util/hardware";

@EventSubscriber()
export class HardwareItemSubscriber implements EntitySubscriberInterface<HardwareItem> {

    private readonly liveServer: LiveServer;

    constructor() {
        this.liveServer = container.get(TYPES.LiveServer);
    }

    listenTo() {
        return HardwareItem;
    }

    afterUpdate(event: UpdateEvent<HardwareItem>) {
        if (!event.entity) {
            return;
        }
        this.liveServer.broadcast({
            event: "ITEM_UPDATE",
            data: HardwareItemSubscriber.serialiseItem(event.entity),
        });
    }

    afterInsert(event: InsertEvent<HardwareItem>) {
        if (!event.entity) {
            return;
        }
        this.liveServer.broadcast({
            event: "ITEM_ADD",
            data: HardwareItemSubscriber.serialiseItem(event.entity),
        });
    }

    private static serialiseItem(item: HardwareItem): ILiveHardwareItem {
        const itemsLeft = item.totalStock - (+item.reservedStock + +item.takenStock);
        return {
            itemID: item.id,
            itemName: item.name,
            itemURL: item.itemURL,
            itemStock: item.totalStock,
            itemsLeft,
            itemHasStock: itemsLeft > 0,
        } as ILiveHardwareItem;
    }
}
