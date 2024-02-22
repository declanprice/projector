import { HandleSubscription, SubscriptionHandler } from '../../../src/subscription'

type CustomerUpdate = {
    customerId: string
    firstName: string
    lastName: string
}

@SubscriptionHandler({
    route: 'customer.updates',
    lookupKey: 'customerId',
})
export class CustomerSubscriptionHandler implements HandleSubscription {
    filter(update: CustomerUpdate, filter: CustomerUpdate) {
        return true
    }

    async handle(update: CustomerUpdate) {
        return update
    }
}
