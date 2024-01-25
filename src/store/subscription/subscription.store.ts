import { Store } from '../store'
import { SubscriptionConnectionItem } from './subscription-connection.item'
import { SubscriptionItem } from './subscription.item'
import { equals } from '@aws/dynamodb-expressions'

export class SubscriptionStore {
    readonly store = new Store(process.env.SUBSCRIPTION_STORE_NAME as string)

    connect(connectionId: string) {
        const item = new SubscriptionConnectionItem(connectionId)
        return this.store.save(item)
    }

    disconnect(connectionId: string) {
        return this.store.delete(connectionId, 'Connection')
    }

    sub(connectionId: string, type: string, lookupKey: string, filter: any) {
        const item = new SubscriptionItem(connectionId, type, lookupKey, filter)
        return this.store.save(item)
    }

    unsub(connectionId: string, type: string, lookupKey: string) {
        return this.store.delete(connectionId, SubscriptionItem.createSk(type, lookupKey))
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
