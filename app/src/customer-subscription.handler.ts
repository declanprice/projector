import { HandleSubscription, SubscriptionHandler } from '../../src/subscription'
import { object, Output, string } from 'valibot'

const CustomerSubscriptionFilterSchema = object({
    customerId: string(),
})

type CustomerSubscriptionFilter = Output<typeof CustomerSubscriptionFilterSchema>

export class CustomerSubscriptionUpdate {
    constructor(
        readonly customerId: string,
        readonly firstName: string,
        readonly lastName: string
    ) {}
}

@SubscriptionHandler({
    route: 'customer.updates',
    lookupKey: 'customerId',
    on: CustomerSubscriptionUpdate,
    filterSchema: CustomerSubscriptionFilterSchema,
})
export class CustomerSubscriptionHandler
    implements HandleSubscription<CustomerSubscriptionUpdate, CustomerSubscriptionFilter>
{
    filter(update: CustomerSubscriptionUpdate, filter: CustomerSubscriptionFilter) {
        return true
    }

    async handle(update: CustomerSubscriptionUpdate) {
        return update
    }
}
