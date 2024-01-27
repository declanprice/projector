import { StoreItem } from '../store.item'

export type ScheduledItem = {
    id: string
    type: string
    data: any
    scheduledAt: string
} & StoreItem
