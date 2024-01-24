import { Store } from '../store'

export class SubscriptionStore {
    readonly store = new Store(process.env.SUBSCRIPTION_STORE_NAME as string)

    async add() {}

    async remove() {}
}
