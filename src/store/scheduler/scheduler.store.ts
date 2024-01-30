import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DeleteItemBuilder, PutItemBuilder, Store } from '@declanprice/dynostore'
import { ScheduledItem } from './scheduled.item'

export class SchedulerStore {
    readonly SCHEDULER_STORE_NAME = process.env.SCHEDULER_STORE_NAME as string

    readonly store: Store

    constructor(readonly tableName: string) {
        this.store = new Store(tableName, new DynamoDBClient())
    }

    schedule(id: string, type: string, data: any, scheduledAt: Date | string): PutItemBuilder<any> {
        const item: ScheduledItem = {
            pk: id,
            id,
            timestamp: new Date().toISOString(),
            type,
            scheduledAt: new Date(scheduledAt).toISOString(),
            data,
        }

        return this.store.put().item(item)
    }

    unschedule(id: string): DeleteItemBuilder<any> {
        return this.store.delete().key({ pk: id })
    }
}
