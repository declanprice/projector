import { StoreItem } from '../store.item'

export type SubscriptionConnectionItem = {
    connectionId: string
} & StoreItem

export const subscriptionConnectionSk = () => 'Connection'
