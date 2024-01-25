import { StoreItem } from '../store.item'

export class SubscriptionItem<Filter> extends StoreItem {
    constructor(
        readonly connectionId: string,
        readonly type: string,
        readonly lookupKey: string,
        readonly filter: Filter
    ) {
        super(connectionId, SubscriptionItem.createSk(type, lookupKey))
    }

    static createSk(type: string, lookupKey: string) {
        return `Subscription|${type}|${lookupKey}`
    }

    fromItem(item: any): any {
        return new SubscriptionItem(item.connectionId, item.type, item.lookupKey, item.filter)
    }
}
