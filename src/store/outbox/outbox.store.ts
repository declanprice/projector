import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { PutItemBuilder, Store } from '@declanprice/dynostore'
import { v4 } from 'uuid'
import { OutboxItem, OutboxItemStatus } from './outbox.item'
import { Event } from '../event/event'

export class OutboxStore {
    readonly store: Store

    constructor(readonly tableName: string) {
        this.store = new Store(tableName, new DynamoDBClient())
    }

    publish(event: Event): PutItemBuilder<any> {
        const id = v4()

        const item: OutboxItem = {
            pk: id,
            id,
            status: OutboxItemStatus.PENDING,
            type: event.type,
            data: event,
            timestamp: new Date().toISOString(),
        }

        return this.store.put().item(item)
    }
}
