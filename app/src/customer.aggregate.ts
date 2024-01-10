import { Aggregate, AggregateHandler, AggregateId, AggregateType } from '../../src/aggregate/aggregate.decorator'

class OrderPlacedEvent {
    orderId: string
    customerId: string
    items: any[]
}

class OrderRejectedEvent {
    orderId: string
}

@Aggregate({
    type: AggregateType.STATE_STORED,
    snapshotPeriod: 10,
})
export class Order {
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
