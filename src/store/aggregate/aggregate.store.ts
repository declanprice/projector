import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { Store } from '@declanprice/dynostore'
import { AggregateItem } from './aggregate.item'

export class AggregateStore extends Store {
    constructor(readonly tableName: string) {
        super(tableName, new DynamoDBClient())
    }
}
