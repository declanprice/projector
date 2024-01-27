import { StoreItem } from '../store.item'

export type SubscriptionItem<Filter> = {
    connectionId: string
    type: string
    lookupKey: string
    filter: Filter
} & StoreItem

export const subscriptionItemSk = (type: string, lookupKey: string) => {
    return `Subscription|${type}|${lookupKey}`
}
