import { EventSubscriber, EntitySubscriberInterface, UpdateEvent } from "typeorm";
import { HardwareItem } from "../../db/entity";
import { SubscriberStore } from "../../util/sse/SubscriberStore";
import { TYPES } from "../../types";
import container from "../../inversify.config";
import { ILiveHardwareItem } from "../../util/hardware";

@EventSubscriber()
export class HardwareItemSubscriber implements EntitySubscriberInterface<HardwareItem> {

    private readonly store: SubscriberStore;

    constructor() {
        this.store = container.get(TYPES.SubscriberStore);
    }

    listenTo() {
        return HardwareItem;
    }

    afterUpdate(event: UpdateEvent<HardwareItem>) {
        if (!event.entity) {
            return;
        }
        this.store.broadcast({
            event: "ITEM_UPDATE",
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
