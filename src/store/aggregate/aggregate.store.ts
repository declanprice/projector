import { TransactWriteItem } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { Store } from '../store'
import { AggregateItem } from './aggregate.item'

export class AggregateStore extends Store {
    constructor(readonly tableName: string) {
        super(tableName)
    }

    // @ts-ignore
    save<I extends AggregateItem>(item: I): TransactWriteItem {
        item.version++
        item.timestamp = new Date().toISOString()

        const expectedVersion = item.version - 1

        return {
            Put: {
                TableName: this.tableName,
                Item: marshall(item, { convertClassInstanceToMap: true, removeUndefinedValues: true }),
                ConditionExpression: '#version = :expectedVersion',
                ExpressionAttributeNames: {
                    '#version': 'version',
                },
                ExpressionAttributeValues: {
                    ':expectedVersion': {
                        N: `${expectedVersion}`,
                    },
                },
            },
        }
    }
}
