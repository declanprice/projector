import { DynamoDBClient, GetItemCommand, TransactWriteItem } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { StoreQueryBuilder } from './store-query-builder'
import { StoreItem } from './store.item'

export class Store {
    private readonly client = new DynamoDBClient()

    constructor(private readonly tableName: string) {}

    query<I extends StoreItem>(): StoreQueryBuilder<I> {
        return new StoreQueryBuilder<I>(this.tableName)
    }

    async find<I extends StoreItem>(pk: string, sk?: string | number): Promise<I | null> {
        const result = await this.client.send(
            new GetItemCommand({
                TableName: this?.tableName,
                Key: marshall(
                    {
                        pk,
                        sk,
                    },
                    { removeUndefinedValues: true }
                ),
                ConsistentRead: true,
            })
        )

        if (!result.Item) return null

        return unmarshall(result.Item) as I
    }

    async get<I extends StoreItem>(pk: string, sk?: string | number): Promise<I> {
        const result = await this.client.send(
            new GetItemCommand({
                TableName: this?.tableName,
                Key: marshall(
                    {
                        pk,
                        sk,
                    },
                    { removeUndefinedValues: true }
                ),
                ConsistentRead: true,
            })
        )

        if (!result.Item) throw new Error('item not found')

        return unmarshall(result.Item) as I
    }

    create<I extends StoreItem>(item: I): TransactWriteItem {
        item.timestamp = new Date().toISOString()
        item.version = 0

        return {
            Put: {
                TableName: this.tableName,
                Item: marshall(item, { convertClassInstanceToMap: true, removeUndefinedValues: true }),
                ConditionExpression: 'attribute_not_exists(pk)',
            },
        }
    }

    save<I extends StoreItem>(item: I): TransactWriteItem {
        if (item.version !== undefined) item.version++

        const expectedVersion = (item?.version || 0) - 1

        return {
            Put: {
                TableName: this.tableName,
                Item: marshall(item, { convertClassInstanceToMap: true, removeUndefinedValues: true }),
                ConditionExpression: item.version !== undefined ? '#version = :expectedVersion' : undefined,
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

    delete(pk: string, sk?: string | number): TransactWriteItem {
        return {
            Delete: {
                TableName: this.tableName,
                Key: marshall(
                    {
                        pk,
                        sk,
                    },
                    { removeUndefinedValues: true }
                ),
            },
        }
    }
}
