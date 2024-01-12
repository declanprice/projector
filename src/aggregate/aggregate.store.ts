import { Type } from '../util/type'
import { getAggregateId } from './aggregate.decorator'
import { DynamoDBClient, GetItemCommand, PutItemCommand, TransactWriteItem } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { AggregateItem } from './aggregate.item'

class AggregateStore {
    readonly AGGREGATE_STORE_NAME = process.env.AGGREGATE_STORE_NAME

    readonly client = new DynamoDBClient()

    async get<E>(type: Type<E>, id: string): Promise<E | null> {
        const result = await this.client.send(
            new GetItemCommand({
                TableName: this.AGGREGATE_STORE_NAME,
                Key: {
                    id: {
                        S: id,
                    },
                    type: {
                        S: type.name,
                    },
                },
            })
        )

        if (!result.Item) return null

        return unmarshall(result.Item) as E
    }

    async save(instance: any) {
        const tx = this.saveTx(instance)

        if (!tx.Put) throw new Error('failed to save')

        await this.client.send(new PutItemCommand(tx.Put))
    }

    saveTx(instance: any): TransactWriteItem {
        const idProperty = getAggregateId(instance)

        if (!idProperty) {
            throw new Error(`${instance.constructor.name} has no @AggregateId`)
        }

        const id = instance[idProperty]

        if (!id) {
            throw new Error(`id has not been set on ${instance.constructor.name} instance`)
        }

        const item: AggregateItem<any> = {
            id,
            type: instance.constructor.name,
            data: instance,
            timestamp: new Date().toISOString(),
            version: 1,
        }

        return {
            Put: {
                TableName: this.AGGREGATE_STORE_NAME,
                Item: marshall(item, { convertClassInstanceToMap: true }),
            },
        }
    }
}

const aggregate = new AggregateStore()

export default aggregate
