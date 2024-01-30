import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { Store } from '@declanprice/dynostore'

export class AggregateStore extends Store {
    constructor(readonly tableName: string) {
        super(tableName, new DynamoDBClient())
    }
}
