import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DeleteItemBuilder, PutItemBuilder, Store } from '@declanprice/dynostore'
import { ScheduledItem } from './scheduled.item'

export class SchedulerStore {
    private readonly store: Store

    constructor(private readonly tableName: string) {
        this.store = new Store(tableName, new DynamoDBClient())
    }

    schedule(id: string, type: string, data: any, scheduledAt: Date | string): PutItemBuilder<any> {
        const item: ScheduledItem = {
            id,
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
