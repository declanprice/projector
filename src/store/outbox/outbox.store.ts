import { TransactWriteItem } from '@aws-sdk/client-dynamodb'
import { v4 } from 'uuid'
import { OutboxItem, OutboxItemStatus } from './outbox.item'
import { isClass } from '../../util/is-class'
import { Store } from '../store'
import { EventItem } from '../event/event.item'

export class OutboxStore {
    readonly OUTBOX_STORE_NAME = process.env.OUTBOX_STORE_NAME as string

    readonly store: Store

    constructor(readonly tableName?: string) {
        this.store = new Store(tableName ?? this.OUTBOX_STORE_NAME)
    }

    publish(event: EventItem): TransactWriteItem {
        if (!isClass(event)) throw new Error('event must be a valid class')

        const id = v4()

        const item = new OutboxItem(id, OutboxItemStatus.PENDING, event)

        return this.store.save(item)
    }
}
