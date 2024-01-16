export enum OutboxItemStatus {
    READY = 'PENDING',
    SCHEDULED = 'SCHEDULED',
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
