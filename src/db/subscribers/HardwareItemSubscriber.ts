import { EventSubscriber, EntitySubscriberInterface, UpdateEvent, ConnectionManager, getConnectionManager } from "typeorm";
import { HardwareItem } from "../../db/entity";
import { HardwareRepository } from "../../repositories";

@EventSubscriber()
export class HardwareItemSubscriber implements EntitySubscriberInterface<HardwareItem> {
    listenTo() {
        return HardwareItem;
    }

    afterUpdate(event: UpdateEvent<HardwareItem>) {
        console.log(event.entity);
    }
}