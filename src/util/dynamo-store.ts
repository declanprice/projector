import {
    DeleteItemCommand,
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    TransactWriteItem,
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { DynamoQueryBuilder } from './dynamo-query-builder'

export type DynamoStoreItem = {
    pk: string
    sk?: string | number
}

export class DynamoStore {
    private readonly client = new DynamoDBClient()

    constructor(private readonly tableName: string) {}

    query<I extends DynamoStoreItem>(): DynamoQueryBuilder<I> {
        return new DynamoQueryBuilder<I>(this.tableName, this.client)
    }

    async get<I extends DynamoStoreItem>(pk: string, sk?: string | number): Promise<I | null> {
        const result = await this.client.send(
            new GetItemCommand({
                TableName: this.tableName,
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

    async create<I extends DynamoStoreItem>(item: I) {
        const tx = this.createTx(item)

        if (!tx.Put) throw new Error('tx.Put does not exist, failed to create.')

        await this.client.send(new PutItemCommand(tx.Put))
    }

    createTx<I extends DynamoStoreItem>(item: I): TransactWriteItem {
        return {
            Put: {
                TableName: this.tableName,
                Item: marshall(item, { convertClassInstanceToMap: true, removeUndefinedValues: true }),
                ConditionExpression: 'attribute_not_exists(pk)',
            },
        }
    }

    async save<I extends DynamoStoreItem>(item: I) {
        const tx = this.saveTx(item)

        if (!tx.Put) throw new Error('failed to save')

        await this.client.send(new PutItemCommand(tx.Put))
    }

    saveTx<I extends DynamoStoreItem>(item: I): TransactWriteItem {
        return {
            Put: {
                TableName: this.tableName,
                Item: marshall(item, { convertClassInstanceToMap: true, removeUndefinedValues: true }),
            },
        }
    }

    async delete(pk: string, sk?: string | number) {
        const tx = this.deleteTx(pk)

        if (!tx.Delete) throw new Error('tx.Delete does not exist, failed to delete.')

        await this.client.send(new DeleteItemCommand(tx.Delete))
    }

    deleteTx(pk: string, sk?: string | number): TransactWriteItem {
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
