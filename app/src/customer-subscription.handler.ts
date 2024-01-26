import { HandleSubscription, SubscriptionHandler } from '../../src/subscription'
import { object, optional, Output, string } from 'valibot'

const CustomerSubscriptionFilterSchema = object({
    customerId: string(),
    firstName: optional(string()),
    lastName: optional(string()),
})

type CustomerSubscriptionFilter = Output<typeof CustomerSubscriptionFilterSchema>

type CustomerUpdate = {
    customerId: string
    firstName: string
    lastName: string
}

@SubscriptionHandler({
    route: 'customer.updates',
    lookupKey: 'customerId',
    filterSchema: CustomerSubscriptionFilterSchema,
})
export class CustomerSubscriptionHandler implements HandleSubscription {
    filter(update: CustomerUpdate, filter: CustomerSubscriptionFilter) {
        return true
    }

    async handle(update: CustomerUpdate) {
        return update
    }
}
