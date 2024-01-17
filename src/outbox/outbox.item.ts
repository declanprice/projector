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

export type OutboxItem = {
    id: string
    status: OutboxItemStatus
    bus: OutboxBusType
    timestamp: string
    type: string
    data: any
}
