import { StoreItem } from '../store.item'

export class SubscriptionConnectionItem extends StoreItem {
    constructor(connectionId: string) {
        super(connectionId, 'Connection')
    }

    fromItem(item: any): any {
        return new SubscriptionConnectionItem(item.connectionId)
    }
}
