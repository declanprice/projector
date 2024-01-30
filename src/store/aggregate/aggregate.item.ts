import { StoreItem } from '../store.item'

export type AggregateItem = {
    type: string
    version: number
} & StoreItem
