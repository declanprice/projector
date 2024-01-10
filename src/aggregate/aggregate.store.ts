import { Type } from '../util/type'
import { AggregateType, getAggregateProps } from './aggregate.decorator'
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { TransactWriteItem } from '@aws-sdk/client-dynamodb/dist-types/models/models_0'

class AggregateStore {
    readonly STATE_STORE_NAME = process.env.STATE_STORE_NAME

    readonly client = new DynamoDBClient()

    operations: TransactWriteItem[] = []

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

    async loadMany(type: Type, ids: string[]) {}

    async apply(instance: any, event: any) {}

    async archive(instance: any, event: any) {}

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
