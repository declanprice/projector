import { Store } from '@declanprice/dynostore'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

export class ProjectionStore extends Store {
    constructor(readonly tableName: string) {
        super(tableName, new DynamoDBClient())
    }
}
