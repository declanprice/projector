import { Aggregate, AggregateHandler, AggregateId, AggregateType } from '../../src/aggregate/aggregate.decorator'

export class CustomerRegisteredEvent {
    constructor(
        readonly customerId: string,
        readonly firstName: string,
        readonly lastName: string
    ) {}
}

@Aggregate({
    type: AggregateType.STATE_STORED,
    snapshotPeriod: 10,
})
export class Customer {
    @AggregateId()
    customerId: string
    firstName: string
    lastName: string

    @AggregateHandler(CustomerRegisteredEvent)
    onOrderPlaced(event: CustomerRegisteredEvent) {
        this.customerId = event.customerId
        this.firstName = event.firstName
        this.lastName = event.lastName
    }
}
