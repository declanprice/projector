import { TransactWriteItem } from '@aws-sdk/client-dynamodb'
import { Store } from '../store'
import { ScheduledItem } from './scheduled.item'

export class SchedulerStore {
    readonly SCHEDULER_STORE_NAME = process.env.SCHEDULER_STORE_NAME as string

    readonly store: Store

    constructor(readonly tableName?: string) {
        this.store = new Store(tableName ?? this.SCHEDULER_STORE_NAME)
    }

    schedule(id: string, type: string, data: any, scheduledAt: Date | string): TransactWriteItem {
        const item: ScheduledItem = {
            pk: id,
            id,
            timestamp: new Date().toISOString(),
            type,
            scheduledAt: new Date(scheduledAt).toISOString(),
            data,
        }

        return this.store.save(item)
    }

    delete(id: string): TransactWriteItem {
        return this.store.delete(id)
    }
}
