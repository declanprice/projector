export enum OutboxItemStatus {
    PENDING = 'PENDING',
    PUBLISHED = 'PUBLISHED',
    SCHEDULED = 'SCHEDULED',
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
