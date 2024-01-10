import { Type } from '../util/type'
import { AggregateType, getAggregateHandler, getAggregateId, getAggregateProps } from './aggregate.decorator'
import { DynamoDBClient, GetItemCommand, PutItemCommand, TransactWriteItem } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

class AggregateStore {
    readonly STATE_STORE_NAME = process.env.STATE_STORE_NAME

    readonly client = new DynamoDBClient()

    async load(type: Type, id: string) {
        const props = getAggregateProps(type)

        if (props.type === AggregateType.STATE_STORED) {
            return this.loadStateStored(type, id)
        }

        if (props.type === AggregateType.EVENT_STORED) {
            return this.loadEventStored(type, id)
        }

        throw new Error('unsupported aggregate type provided')
    }

    async apply(instance: any, event: any) {
        const method = getAggregateHandler(instance, event.constructor.name)

        const idProperty = getAggregateId(instance)

        if (!method) {
            throw new Error(`${instance.constructor.name} has no @AggregateHandler for event ${event.constructor.name}`)
        }

        if (!idProperty) {
            throw new Error(`${instance.constructor.name} has no @AggregateId`)
        }

        instance[method](event)

        const id = instance[idProperty]

        if (!id) {
            throw new Error(`id has not been set on ${instance.constructor.name} instance`)
        }

        await this.client.send(
            new PutItemCommand({
                TableName: this.STATE_STORE_NAME,
                Item: marshall(
                    {
                        id,
                        type: instance.constructor.name,
                        lastEvent: {
                            type: event.constructor.name,
                            data: event,
                        },
                        version: 1,
                        ...instance,
                    },
                    { convertClassInstanceToMap: true }
                ),
            })
        )
    }

    applyTx(type: Type, id: string, event: any): TransactWriteItem {
        return {
            Update: {
                TableName: '',
                Key: {},
                ExpressionAttributeNames: {},
                ExpressionAttributeValues: {},
                UpdateExpression: '',
            },
        }
    }

    private async loadStateStored(type: Type, id: string): Promise<any | null> {
        const result = await this.client.send(
            new GetItemCommand({
                TableName: this.STATE_STORE_NAME,
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

        console.log('result', result)

        if (!result.Item) return null

        return result.Item
    }

    private async loadEventStored(type: Type, id: string) {}
}

const aggregate = new AggregateStore()

export default aggregate
