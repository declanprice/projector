import { DynamoDBClient, GetItemCommand, PutItemCommand, TransactWriteItem } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { getProjectionId } from './projection.decorator'
import { Type } from '../util/type'
import { ProjectionQueryBuilder } from './projection-query-builder'

class ProjectionStore {
    readonly client = new DynamoDBClient()

    async get<E>(type: Type<E>, id: string): Promise<E | null> {
        const result = await this.client.send(
            new GetItemCommand({
                TableName: `${type.name}Store`,
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

    query(type: Type) {
        return new ProjectionQueryBuilder(type, this.client)
    }

    async save(instance: any) {
        const tx = this.saveTx(instance)

        if (!tx.Put) throw new Error('failed to save')

        await this.client.send(new PutItemCommand(tx.Put))
    }

    saveTx(instance: any): TransactWriteItem {
        const idProperty = getProjectionId(instance)

        if (!idProperty) {
            throw new Error(`${instance.constructor.name} has no @AggregateId`)
        }

        const id = instance[idProperty]

        if (!id) {
            throw new Error(`id has not been set on ${instance.constructor.name} instance`)
        }

        return {
            Put: {
                TableName: `${instance.constructor.name}Store`,
                Item: marshall(
                    {
                        id,
                        type: instance.constructor.name,
                        version: 1,
                        ...instance,
                    },
                    { convertClassInstanceToMap: true }
                ),
            },
        }
    }
}

const projection = new ProjectionStore()

export default projection
