import { DynamoDBStreamEvent } from 'aws-lambda'
import { EventBridgeClient, PutEventsCommand, PutEventsRequestEntry } from '@aws-sdk/client-eventbridge'
import { PublishBatchCommand, PublishBatchRequestEntry, SNSClient } from '@aws-sdk/client-sns'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { DynamoDBClient, TransactWriteItem, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb'
import { v4 } from 'uuid'
import { OutboxBusType, OutboxItem, OutboxItemStatus } from '../../outbox/outbox.item'
import { EventBusMessage } from '../../event'
import { CommandBusMessage } from '../../command'

const eventBridgeClient = new EventBridgeClient()
const snsClient = new SNSClient()
const dynamoClient = new DynamoDBClient()

export const outboxPublisherHandler = async (event: DynamoDBStreamEvent) => {
    const OUTBOX_STORE_NAME = process.env.OUTBOX_STORE_NAME as string
    const COMMAND_BUS_ARN = process.env.COMMAND_BUS_ARN as string
    const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME as string

    const eventsToPut: PutEventsRequestEntry[] = []
    const commandsToPublish: PublishBatchRequestEntry[] = []
    const outboxItemsToUpdate: TransactWriteItem[] = []

    const forwardOutboxItem = (item: OutboxItem) => {
        const message: EventBusMessage<any> | CommandBusMessage<any> = {
            type: item.type,
            data: item.data,
            timestamp: item.timestamp,
        }

        if (item.bus === OutboxBusType.EVENT) {
            eventsToPut.push({
                EventBusName: EVENT_BUS_NAME,
                DetailType: 'EVENT',
                Source: 'OutboxPublisher',
                Detail: JSON.stringify(message),
            })
        }

        if (item.bus === OutboxBusType.COMMAND) {
            commandsToPublish.push({
                Id: v4(),
                MessageAttributes: {
                    type: { StringValue: message.type, DataType: 'String' },
                },
                Message: JSON.stringify(message),
            })
        }

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
        let item: OutboxItem | null = null

        if (record.eventName === 'REMOVE') {
            console.log(`record is type ${record.eventName}, ignoring record.`)
            continue
        }

        if ((record.eventName === 'INSERT' || record.eventName === 'MODIFY') && record.dynamodb?.NewImage) {
            item = unmarshall(record.dynamodb.NewImage as any) as OutboxItem

            if (item.status === OutboxItemStatus.READY) {
                forwardOutboxItem(item)
            } else {
                console.log(`item status is ${item.status}, ignoring record.`)
            }
        }
    }

    if (eventsToPut.length) {
        console.log('eventsToPut', eventsToPut)

        const response = await eventBridgeClient.send(
            new PutEventsCommand({
                Entries: eventsToPut,
            })
        )

        console.log('eventsResponse', response)
    }

    if (commandsToPublish.length) {
        console.log('commandsToPublish', commandsToPublish)

        const response = await snsClient.send(
            new PublishBatchCommand({
                TopicArn: COMMAND_BUS_ARN,
                PublishBatchRequestEntries: commandsToPublish,
            })
        )

        console.log('commandsResponse', response)
    }

    if (outboxItemsToUpdate.length) {
        console.log('outboxItemsToUpdate', outboxItemsToUpdate)

        const response = await dynamoClient.send(
            new TransactWriteItemsCommand({
                TransactItems: outboxItemsToUpdate,
            })
        )

        console.log('outboxItemsToUpdateResponse', response)
    }
}
