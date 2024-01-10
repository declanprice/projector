import { Type } from 'aws-cdk-lib/assertions/lib/private/type'
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { getAggregateHandler, getAggregateId } from '../aggregate/aggregate.decorator'
import { marshall } from '@aws-sdk/util-dynamodb'
import { getProjectionId } from './projection.decorator'

class ProjectionStore {
    readonly client = new DynamoDBClient()

    async get(type: Type, id: string) {}

    async query(type: Type) {}

    async save(instance: any) {
        const idProperty = getProjectionId(instance)

        if (!idProperty) {
            throw new Error(`${instance.constructor.name} has no @AggregateId`)
        }

        const id = instance[idProperty]

        if (!id) {
            throw new Error(`id has not been set on ${instance.constructor.name} instance`)
        }

        await this.client.send(
            new PutItemCommand({
                TableName: `${instance.constructor.name}-Store`,
                Item: marshall(
                    {
                        id,
                        type: instance.constructor.name,
                        version: 1,
                        ...instance,
                    },
                    { convertClassInstanceToMap: true }
                ),
            })
        )
    }

    async delete(type: Type, id: string) {}
}

const projection = new ProjectionStore()

export default projection
