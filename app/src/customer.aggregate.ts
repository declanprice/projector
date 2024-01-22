import { AggregateStoreItem } from '../../src/aggregate/aggregate.item'

export class Customer extends AggregateStoreItem {
    constructor(
        readonly customerId: string,
        readonly firstName: string,
        readonly lastName: string
    ) {
        super(customerId)
    }

    fromItem(item: any): Customer {
        return new Customer(item.customerId, item.firstName, item.lastName)
    }
}
