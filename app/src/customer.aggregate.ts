import { AggregateItem } from '../../src/store/aggregate/aggregate.item'

export class Customer extends AggregateItem {
    constructor(
        readonly customerId: string,
        readonly firstName: string,
        readonly lastName: string,
        readonly scheduledTaskId: string
    ) {
        super(customerId)
    }

    fromItem(item: any): Customer {
        return new Customer(item.customerId, item.firstName, item.lastName, item.scheduledTaskId)
    }
}
