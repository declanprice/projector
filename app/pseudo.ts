class OrderUpdateSubscription {
    orderId: string
}

@SubscriptionHandler({
    path: 'orders.updates',
    on: OrderUpdate,
    schema: OrderUpdateSubscription,
    lookupKey: 'orderId',
})
export class OrderUpdates {
    async onConnect() {
        throw new Error('user does not have permission to subscribe')
    }

    async onDisconnect() {
        // do something
    }

    filter(update: OrderUpdate, connection: Subscription<OrderUpdateSubscription>) {
        return update.sss === connecton.filter.sss
    }

    async handle(update: OrderUpdate) {
        return {}
    }
}
