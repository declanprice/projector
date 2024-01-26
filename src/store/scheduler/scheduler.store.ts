import { TransactWriteItem } from '@aws-sdk/client-dynamodb'
import { Store } from '../store'
import { ScheduledItem } from './scheduled.item'
import { isClass } from '../../util/is-class'
import { Event } from '../event/event'

export class SchedulerStore {
    readonly SCHEDULER_STORE_NAME = process.env.SCHEDULER_STORE_NAME as string

    readonly store: Store

    constructor(readonly tableName?: string) {
        this.store = new Store(tableName ?? this.SCHEDULER_STORE_NAME)
    }

    schedule(id: string, event: Event, scheduledAt: Date | string): TransactWriteItem {
        if (!isClass(event)) throw new Error('event must be a valid class')
        const item = new ScheduledItem(id, event.type, event, new Date(scheduledAt).toISOString())
        return this.store.save(item)
    }

    delete(id: string): TransactWriteItem {
        return this.store.delete(id)
    }
}
