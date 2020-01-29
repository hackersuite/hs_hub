import { Subscriber, ISubscriberMessage } from "./Subscriber";

/**
 * Manages a collection of subscribers, automatically removing them once disconnected.
 */
export class SubscriberStore {
    private _subscribers: Set<Subscriber>;
    
    constructor() {
        this._subscribers = new Set();
    }

    /**
     * Adds a subscriber to the store if they aren't already part of it
     * @param subscriber The subscriber to add
     */
    addSubscriber(subscriber: Subscriber) {
        this._subscribers.add(subscriber);
        subscriber.once("end", () => this._subscribers.delete(subscriber));
    }

    /**
     * Sends a message to every subscriber
     * @param data The message/string to send
     */
    broadcast(data: ISubscriberMessage | string) {
        if (typeof data !== "string") {
            data = Subscriber.serialiseMessage(data);
        }
        for (const subscriber of this._subscribers) {
            subscriber.send(data);
        }
    }
}