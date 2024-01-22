import { StoreItem } from '../store/store.item'

export enum OutboxItemStatus {
    PENDING = 'PENDING',
    SCHEDULED = 'SCHEDULED',
    SCHEDULED_IN_QUEUE = 'SCHEDULED_IN_QUEUE',
    PUBLISHED = 'PUBLISHED',
}

export enum OutboxBusType {
    COMMAND = 'COMMAND',
    EVENT = 'EVENT',
}

export class OutboxItem extends StoreItem {
    constructor(
        readonly id: string,
        readonly status: OutboxItemStatus,
        readonly bus: OutboxBusType,
        readonly publishAt: string,
        readonly type: string,
        readonly data: any
    ) {
        super(id)
    }

    fromItem(item: any): OutboxItem {
        return new OutboxItem(item.id, item.status, item.bus, item.publishAt, item.type, item.data)
    }
}
