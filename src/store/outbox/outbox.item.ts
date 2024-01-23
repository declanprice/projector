import { StoreItem } from '../store.item'
import { EventItem } from '../event/event.item'

export enum OutboxItemStatus {
    PENDING = 'PENDING',
    PUBLISHED = 'PUBLISHED',
}

export class OutboxItem extends StoreItem {
    constructor(
        readonly id: string,
        readonly status: OutboxItemStatus,
        readonly event: EventItem
    ) {
        super(id)
    }

    fromItem(item: any): OutboxItem {
        return new OutboxItem(item.id, item.status, item.event)
    }
}
