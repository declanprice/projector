@Aggregate({
    type: AggregateType.STATE_STORED,
    snapshotPeriod: 10,
})
class Order {
    @AggregateId()
    orderId: string
    customerId: string
    items: any[]
    status: string

    @AggregateHandler(OrderPlacedEvent)
    onOrderPlaced(event: OrderPlacedEvent) {
        this.orderId = event.orderId
        this.customerId = event.customerId
        this.items = event.items
        this.status = 'placed'
    }

    @AggregateHandler(OrderRejectedEvent)
    onRejected() {
        this.status = 'rejected'
    }
}

@Projection({})
class OrderProjection {
    @ProjectionId()
    orderId: string
    customerId: string
    items: any[]
}

@CommandHandler({
    path: 'orders/place',
    schema: object({}),
})
export class PlaceOrder {
    async handle(command: any) {
        const orderAgg = await aggregate.load(Order, '1')

        aggregate.apply(new Order({ orderId: '1' }), new OrderPlacedEvent({ orderId: '1' }))

        scheduler.add('new-task', {
            data: 'hello',
        })
    }
}

@QueryHandler({
    path: 'orders/{id}',
    schema: object({}),
})
export class GetOrderById {
    async handle(command: any) {
        return projection.get(OrderProjection, data.orderId)
    }
}

@SubscriptionHandler({
    path: 'orders.updates',
    on: OrderUpdate,
    schema: object({}),
    lookupKey: 'orderId',
})
export class OrderUpdates {
    async onConnect() {
        throw new Error('user does not have permission to subscribe')
    }

    async onDisconnect() {
        // do something
    }

    async filter(update: OrderUpdate, connection: Connection) {
        return update.sss === connecton.filter.sss
    }

    async handle(update: OrderUpdate) {
        return {}
    }
}

@ScheduledTaskHandler({
    on: 'something-task',
})
export class CancelOrderIfNoResponse {
    async handle() {
        // do something on deadline
    }
}

@EventHandler({
    on: [OrderPlacedEvent, OrderRejectedEvent],
    batchSize: 10,
})
export class EmailOnOrder {
    async handle(event: OrderPlacedEvent | OrderRejectedEvent, aggregate: Order) {
        const order = await projection.get(OrderProjection, aggregate.orderId)

        order.something = aggregate.something

        await projection.update(order)

        if (!isReplay()) {
            await subscription.emit(new OrderSubscriptionUpdate(''))
        }
    }
}
