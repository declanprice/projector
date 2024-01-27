import { TransactWriteItem } from '@aws-sdk/client-dynamodb'
import { v4 } from 'uuid'
import { OutboxItem, OutboxItemStatus } from './outbox.item'
import { Store } from '../store'

export class OutboxStore {
    readonly OUTBOX_STORE_NAME = process.env.OUTBOX_STORE_NAME as string

    readonly store: Store

    constructor(readonly tableName?: string) {
        this.store = new Store(tableName ?? this.OUTBOX_STORE_NAME)
    }

    publish(event: Event): TransactWriteItem {
        const id = v4()

        const item: OutboxItem = {
            pk: id,
            id,
            status: OutboxItemStatus.PENDING,
            type: event.type,
            data: event,
            timestamp: new Date().toISOString(),
        }

        return this.store.save(item)
    }
}
