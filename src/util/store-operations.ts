import aggregate from '../aggregate/aggregate-store'
import { DynamoDBClient, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb'
import outbox from '../outbox/outbox-store'
import processContext from '../process/process-store'
import projection from '../projection/projection-store'
const client = new DynamoDBClient()

export const flushStoreOperations = () => {
    aggregate.operations = []
    outbox.operations = []
    processContext.operations = []
    projection.operations = []
}

export const commitStoreOperations = async () => {
    if (aggregate.operations.length + outbox.operations.length + processContext.operations.length + projection.operations.length > 1) {
        await client.send(
            new TransactWriteItemsCommand({
                TransactItems: [...aggregate.operations, ...outbox.operations, ...processContext.operations, ...projection.operations],
            })
        )
    }
}
