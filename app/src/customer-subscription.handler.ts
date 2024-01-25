import { HandleSubscription, SubscriptionHandler } from '../../src/subscription'
import { object, Output, string } from 'valibot'

const CustomerSubscriptionFilterSchema = object({
    customerId: string(),
})

type CustomerSubscriptionFilter = Output<typeof CustomerSubscriptionFilterSchema>

export type CustomerSubscriptionUpdate = {
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
    filter(update: CustomerSubscriptionUpdate, filter: CustomerSubscriptionFilter) {
        return true
    }

    async handle(update: CustomerSubscriptionUpdate) {
        return update
    }
}
