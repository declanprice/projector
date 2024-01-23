import { DynamoDBStreamEvent } from 'aws-lambda'
import { EventBridgeClient, PutEventsCommand, PutEventsRequestEntry } from '@aws-sdk/client-eventbridge'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { DynamoDBClient, TransactWriteItem, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb'
import { OutboxItem, OutboxItemStatus } from '../../store/outbox/outbox.item'
import { EventBusMessage } from '../../event'

const eventBridgeClient = new EventBridgeClient()
const dynamoClient = new DynamoDBClient()

export const outboxPublisherHandler = async (event: DynamoDBStreamEvent) => {
    const OUTBOX_STORE_NAME = process.env.OUTBOX_STORE_NAME as string
    const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME as string

    const eventsToPut: PutEventsRequestEntry[] = []
    const outboxItemsToUpdate: TransactWriteItem[] = []

    const forwardOutboxItem = (item: OutboxItem) => {
        const message: EventBusMessage<any> = {
            messageId: item.id,
            type: item.event.type,
            data: item.event,
            timestamp: item.timestamp,
        }

        eventsToPut.push({
            EventBusName: EVENT_BUS_NAME,
            DetailType: 'EVENT',
            Source: 'OutboxPublisher',
            Detail: JSON.stringify(message),
        })

        outboxItemsToUpdate.push({
            Update: {
                TableName: OUTBOX_STORE_NAME,
                Key: {
                    id: {
                        S: item.id,
                    },
                },
                UpdateExpression: 'SET #status = :status',
                ExpressionAttributeNames: {
                    '#status': 'status',
                },
                ExpressionAttributeValues: {
                    ':status': {
                        S: OutboxItemStatus.PUBLISHED,
                    },
                },
            },
        })
    }

    for (const record of event.Records) {
        if (record.eventName === 'REMOVE' || record.eventName === 'MODIFY') {
            console.log(`[IGNORING RECORD] - record is type ${record.eventName}.`)
            continue
        }

        if (record.eventName === 'INSERT' && record.dynamodb?.NewImage) {
            const item = unmarshall(record.dynamodb.NewImage as any) as OutboxItem
            forwardOutboxItem(item)
        }
    }

    if (eventsToPut.length) {
        console.log('[EVENTS TO PUT] -', eventsToPut)

        const response = await eventBridgeClient.send(
            new PutEventsCommand({
                Entries: eventsToPut,
            })
        )

        console.log('[PUT RESPONSE] - ', response)
    }

    if (outboxItemsToUpdate.length) {
        console.log('[OUTBOX ITEMS TO UPDATE] - ', outboxItemsToUpdate)

        const response = await dynamoClient.send(
            new TransactWriteItemsCommand({
                TransactItems: outboxItemsToUpdate,
            })
        )

        console.log('[UPDATE RESPONSE]', response)
    }
}
