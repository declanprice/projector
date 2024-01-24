import { HandleSubscription, SubscriptionHandler } from '../../src/subscription'
import { object, Output, string } from 'valibot'

const customerSubscriptionFilter = object({
    customerId: string(),
})

type CustomerSubscriptionFilter = Output<typeof customerSubscriptionFilter>

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
    schema: customerSubscriptionFilter,
})
export class CustomerSubscriptionHandler
    implements HandleSubscription<CustomerSubscriptionUpdate, CustomerSubscriptionFilter>
{
    async onAdd(filter: CustomerSubscriptionFilter) {}

    async onRemove(filter: CustomerSubscriptionFilter) {}

    filter(update: CustomerSubscriptionUpdate, filter: CustomerSubscriptionFilter) {
        return true
    }

    async handle(update: CustomerSubscriptionUpdate) {
        return update
    }
}
