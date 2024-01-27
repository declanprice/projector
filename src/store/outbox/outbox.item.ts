import { StoreItem } from '../store.item'

export enum OutboxItemStatus {
    PENDING = 'PENDING',
    PUBLISHED = 'PUBLISHED',
}

export type OutboxItem = {
    id: string
    status: OutboxItemStatus
    type: string
    data: any
} & StoreItem
