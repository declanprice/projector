import { eq, Store } from '@declanprice/dynostore'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { SubscriptionConnectionItem, subscriptionConnectionSk } from './subscription-connection.item'
import { SubscriptionItem, subscriptionItemSk } from './subscription.item'

export class SubscriptionStore {
    readonly store = new Store(process.env.SUBSCRIPTION_STORE_NAME as string, new DynamoDBClient())

    connect(connectionId: string) {
        const item: SubscriptionConnectionItem = {
            pk: connectionId,
            sk: subscriptionConnectionSk(),
            connectionId,
        }

        return this.store.put().item(item)
    }

    disconnect(connectionId: string) {
        return this.store.delete().key({ pk: connectionId, sk: subscriptionConnectionSk() })
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

        return this.store.put().item(item)
    }

    unsub(connectionId: string, type: string, lookupKey: string) {
        return this.store.delete().key({ pk: connectionId, sk: subscriptionItemSk(type, lookupKey) })
    }

    delete() {
        return this.store.delete()
    }

    querySubsByLookupKey(type: string, lookupKey: string) {
        return this.store.query().using('lookupKey-index').pk('lookupKey', lookupKey).sk(eq('type', type))
    }

    queryItemsByConnectionId<Item>(connectionId: string) {
        return this.store.query<Item>().pk('pk', connectionId)
    }
}
