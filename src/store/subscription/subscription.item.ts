import { StoreItem } from '../store.item'

export type SubscriptionItem = {
    connectionId: string
    type: string
    lookupKey: string
    filter: any
} & StoreItem

export const subscriptionItemSk = (type: string, lookupKey: string) => {
    return `Subscription|${type}|${lookupKey}`
}
