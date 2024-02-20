import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DeleteItemBuilder, PutItemBuilder, Store } from '@declanprice/dynostore'
import { ScheduledItem } from './scheduled.item'

export class SchedulerStore extends Store {
    constructor(readonly tableName: string) {
        super(tableName, new DynamoDBClient())
    }
}
