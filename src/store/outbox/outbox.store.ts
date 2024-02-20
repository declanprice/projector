import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { PutItemBuilder, Store } from '@declanprice/dynostore'
import { v4 } from 'uuid'
import { OutboxItem, OutboxItemStatus } from './outbox.item'

export class OutboxStore extends Store {
    constructor(readonly tableName: string) {
        super(tableName, new DynamoDBClient())
    }
}
