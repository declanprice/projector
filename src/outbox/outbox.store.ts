import { TransactWriteItem } from '@aws-sdk/client-dynamodb'
import { v4 } from 'uuid'
import { OutboxBusType, OutboxItem, OutboxItemStatus } from './outbox.item'
import { isClass } from '../util/is-class'
import { Store } from '../store/store'

type OutboxSetOptions = {
    publishAt: string
}

export class Outbox {
    readonly OUTBOX_STORE_NAME = process.env.OUTBOX_STORE_NAME

    readonly store: Store

    constructor(readonly tableName?: string) {
        this.store = new Store(tableName ?? this.OUTBOX_STORE_NAME)
    }

    command(command: any, options?: OutboxSetOptions): TransactWriteItem {
        if (!isClass(command)) throw new Error('command must be a valid class')

        const id = v4()

        const item = new OutboxItem(
            id,
            options?.publishAt ? OutboxItemStatus.SCHEDULED : OutboxItemStatus.PENDING,
            OutboxBusType.COMMAND,
            options?.publishAt ?? new Date().toISOString(),
            command.constructor.name,
            command
        )

        return this.store.save(item)
    }

    event(event: any, options?: OutboxSetOptions): TransactWriteItem {
        if (!isClass(event)) throw new Error('event must be a valid class')

        const id = v4()

        const item = new OutboxItem(
            id,
            options?.publishAt ? OutboxItemStatus.SCHEDULED : OutboxItemStatus.PENDING,
            OutboxBusType.EVENT,
            options?.publishAt ?? new Date().toISOString(),
            event.constructor.name,
            event
        )

        return this.store.save(item)
    }

    delete(id: string): TransactWriteItem {
        return this.store.delete(OutboxItem, id)
    }
}
