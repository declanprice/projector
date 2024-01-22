import {
    DeleteItemCommand,
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    TransactWriteItem,
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { DynamoQueryBuilder } from './dynamo-query-builder'
import { Type } from './type'

export abstract class StoreItem {
    timestamp: string

    constructor(
        private readonly _pk: string,
        private readonly _sk?: string | number
    ) {
        this.timestamp = new Date().toISOString()
    }

    get pk(): string {
        return this._pk
    }

    get sk(): string | number | undefined {
        return this._sk
    }

    abstract fromItem(item: any): any
}

export class DynamoStore {
    private readonly client = new DynamoDBClient()

    constructor(private readonly tableName?: string) {}

    query<I extends StoreItem>(type: Type<I>): DynamoQueryBuilder<I> {
        return new DynamoQueryBuilder<I>(type, this?.tableName ?? type.name)
    }

    async get<I extends StoreItem>(type: Type<I>, pk: string, sk?: string | number): Promise<I | null> {
        const result = await this.client.send(
            new GetItemCommand({
                TableName: this?.tableName ?? type.name,
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

        const item = unmarshall(result.Item)

        return new type().fromItem(item) as I
    }

    async create<I extends StoreItem>(item: I) {
        const tx = this.createTx(item)

        if (!tx.Put) throw new Error('tx.Put does not exist, failed to create.')

        await this.client.send(new PutItemCommand(tx.Put))
    }

    createTx<I extends StoreItem>(item: I): TransactWriteItem {
        return {
            Put: {
                TableName: this?.tableName ?? item.constructor.name,
                Item: marshall(
                    {
                        ...item,
                        pk: item.pk,
                        sk: item.sk,
                    },
                    { convertClassInstanceToMap: true, removeUndefinedValues: true }
                ),
                ConditionExpression: 'attribute_not_exists(pk)',
            },
        }
    }

    async save<I extends StoreItem>(item: I) {
        const tx = this.saveTx(item)

        if (!tx.Put) throw new Error('failed to save')

        await this.client.send(new PutItemCommand(tx.Put))
    }

    saveTx<I extends StoreItem>(item: I): TransactWriteItem {
        return {
            Put: {
                TableName: this?.tableName ?? item.constructor.name,
                Item: marshall(
                    {
                        ...item,
                        pk: item.pk,
                        sk: item.sk,
                    },
                    { convertClassInstanceToMap: true, removeUndefinedValues: true }
                ),
            },
        }
    }

    async delete<I extends StoreItem>(type: Type<I>, pk: string, sk?: string | number) {
        const tx = this.deleteTx(type, pk, sk)

        if (!tx.Delete) throw new Error('tx.Delete does not exist, failed to delete.')

        await this.client.send(new DeleteItemCommand(tx.Delete))
    }

    deleteTx<I extends StoreItem>(type: Type<I>, pk: string, sk?: string | number): TransactWriteItem {
        return {
            Delete: {
                TableName: this?.tableName ?? type.name,
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
