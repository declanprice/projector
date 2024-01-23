import {
    DeleteItemCommand,
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    TransactWriteItem,
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { StoreQueryBuilder } from './store-query-builder'
import { Type } from '../util/type'
import { StoreItem } from './store.item'

export class Store {
    private readonly client = new DynamoDBClient()

    constructor(private readonly tableName: string) {}

    query<I extends StoreItem>(type: Type<I>): StoreQueryBuilder<I> {
        return new StoreQueryBuilder<I>(type, this.tableName)
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

    create<I extends StoreItem>(item: I): TransactWriteItem {
        return {
            Put: {
                TableName: this.tableName,
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

    save<I extends StoreItem>(item: I): TransactWriteItem {
        return {
            Put: {
                TableName: this.tableName,
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

    delete<I extends StoreItem>(pk: string, sk?: string | number): TransactWriteItem {
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
