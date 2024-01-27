import { Store } from '../store'
import { SubscriptionConnectionItem, subscriptionConnectionSk } from './subscription-connection.item'
import { SubscriptionItem, subscriptionItemSk } from './subscription.item'
import { equals } from '@aws/dynamodb-expressions'

export class SubscriptionStore {
    readonly store = new Store(process.env.SUBSCRIPTION_STORE_NAME as string)

    connect(connectionId: string) {
        const item: SubscriptionConnectionItem = {
            pk: connectionId,
            sk: subscriptionConnectionSk(),
            connectionId,
        }

        return this.store.save(item)
    }

    disconnect(connectionId: string) {
        return this.store.delete(connectionId, subscriptionConnectionSk())
    }

    sub(connectionId: string, type: string, lookupKey: string, filter: any) {
        const item: SubscriptionItem<any> = {
            pk: connectionId,
            sk: subscriptionItemSk(type, lookupKey),
            type,
            connectionId,
            lookupKey,
            filter,
        }

        return this.store.save(item)
    }

    unsub(connectionId: string, type: string, lookupKey: string) {
        return this.store.delete(connectionId, subscriptionItemSk(type, lookupKey))
    }

    delete(pk: string, sk?: string | number) {
        return this.store.delete(pk, sk)
    }

    async querySubsByLookupKey(type: string, lookupKey: string) {
        return this.store.query().using('lookupKey-index').pk('lookupKey', lookupKey).sk('type', equals(type)).exec()
    }

    async queryItemsByConnectionId(connectionId: string) {
        return this.store.query().pk('pk', connectionId).exec()
    }
}
