import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb'
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import { lessThan } from '@aws/dynamodb-expressions'
import { DynamoQueryBuilder } from '../../util/dynamo-query-builder'
import { addMinutes } from 'date-fns'
import { OutboxItem, OutboxItemStatus } from '../../outbox/outbox.item'

const dynamoClient = new DynamoDBClient()
const sqsClient = new SQSClient()

export const outboxPollerHandler = async () => {
    const OUTBOX_STORE_NAME = process.env.OUTBOX_STORE_NAME as string
    const OUTBOX_PUBLISHER_QUEUE_URL = process.env.OUTBOX_PUBLISHER_QUEUE_URL as string
    const queryBuilder = new DynamoQueryBuilder<OutboxItem>(OUTBOX_STORE_NAME, dynamoClient)

    const getScheduledItems = async (): Promise<OutboxItem[]> => {
        const next10Minutes = addMinutes(new Date(), 10).toISOString()

        const result = await queryBuilder
            .using('status-index')
            .pk('status', OutboxItemStatus.SCHEDULED)
            .sk('timestamp', lessThan(next10Minutes))
            .exec()

        return result.data
    }

    const sendMessage = async (item: OutboxItem) => {
        await sqsClient.send(
            new SendMessageCommand({
                QueueUrl: OUTBOX_PUBLISHER_QUEUE_URL,
                MessageBody: JSON.stringify(item),
            })
        )

        console.log(`outbox item with id ${item.id} successfully send to queue.`)
    }

    const updateItem = async (item: OutboxItem) => {
        await dynamoClient.send(
            new UpdateItemCommand({
                TableName: OUTBOX_STORE_NAME,
                Key: {
                    id: {
                        S: item.id,
                    },
                },
                UpdateExpression: 'set #status = :status',
                ExpressionAttributeNames: {
                    '#status': 'status',
                },
                ExpressionAttributeValues: {
                    ':status': {
                        S: OutboxItemStatus.SCHEDULED_IN_QUEUE,
                    },
                },
            })
        )

        console.log(
            `outbox item with id ${item.id} successfully updated status to ${OutboxItemStatus.SCHEDULED_IN_QUEUE}`
        )
    }

    const scheduledOutboxItems = await getScheduledItems()

    console.log(`found ${scheduledOutboxItems.length} outbox items to process`)

    for (const item of scheduledOutboxItems) {
        await sendMessage(item)
        await updateItem(item)
    }
}
