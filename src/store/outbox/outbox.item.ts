import { StoreItem } from '../store.item'
import { Event } from '../event/event'

export enum OutboxItemStatus {
    PENDING = 'PENDING',
    PUBLISHED = 'PUBLISHED',
}

export class OutboxItem extends StoreItem {
    constructor(
        readonly id: string,
        readonly status: OutboxItemStatus,
        readonly event: Event
    ) {
        super(id)
    }

    fromItem(item: any): OutboxItem {
        return new OutboxItem(item.id, item.status, item.event)
    }
}
