export type SubscriptionItem = {
    pk: string
    sk: string
    connectionId: string
    type: string
    lookupKey: string
    filter: any
}

export const subscriptionItemSk = (type: string, lookupKey: string) => {
    return `Subscription|${type}|${lookupKey}`
}
