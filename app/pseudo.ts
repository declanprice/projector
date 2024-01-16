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

@Process({
    batchSize: 10,
    multi: true,
    defaultKey: 'orderId',
})
export class OrderProcess {
    @StartProcess(OrderPlacedEvent)
    onPlaced(context: ProcessContext<OrderPlacedEvent>) {
        const update = context.tx.updateTx({
            orderId: context.event.orderId,
            status: context.event.status,
        })

        const associate = context.associate('123')

        const command = outbox.commandTx(new DoSomethingCommand(), { timestamp: new Date('04/04/2024 15:00:00') })

        await transaction(update, associate, command)
    }

    @ProcessHandler(OrderAcceptedEvent)
    onAccepted(event: OrderAcceptedEvent) {
        process.data.status = 'accepted'
    }

    @EndProcess(SomethingDeadline)
    onDeadline() {}

    @EndProcess(OrderRejectedEvent)
    onRejected(event: OrderRejectedEvent) {
        process.data.status = 'rejected'
    }
}
