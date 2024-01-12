import { Aggregate, AggregateId } from '../../src/aggregate'

@Aggregate()
export class Customer {
    @AggregateId()
    customerId: string
    firstName: string
    lastName: string

    constructor(data: { customerId: string; firstName: string; lastName: string }) {
        this.customerId = data.customerId
        this.firstName = data.firstName
        this.lastName = data.lastName
    }
}
