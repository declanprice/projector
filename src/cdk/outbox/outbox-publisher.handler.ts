import { DynamoDBStreamEvent, SQSEvent } from 'aws-lambda'
import { isSqsRecord } from '../../util/is-sqs-event'
import { isDynamoRecord } from '../../util/is-dynamo-record'
import { EventBridgeClient, PutEventsCommand, PutEventsRequestEntry } from '@aws-sdk/client-eventbridge'
import { PublishBatchCommand, PublishBatchRequestEntry, SNSClient } from '@aws-sdk/client-sns'
import { OutboxBusType, OutboxItem } from '../../outbox/outbox.item'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBusMessage } from '../../event'
import { CommandBusMessage } from '../../command'
import { v4 } from 'uuid'

const eventBridgeClient = new EventBridgeClient()
const snsClient = new SNSClient()

export const outboxPublisherHandler = async (event: DynamoDBStreamEvent | SQSEvent) => {
    const COMMAND_BUS_ARN = process.env.COMMAND_BUS_ARN as string
    const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME as string

    const eventsToPut: PutEventsRequestEntry[] = []
    const commandsToPublish: PublishBatchRequestEntry[] = []

    const forwardOutboxItem = (item: OutboxItem) => {
        const busMessage: EventBusMessage<any> | CommandBusMessage<any> = {
            type: item.type,
            timestamp: item.timestamp,
            data: item.data,
        }

        if (item.bus === OutboxBusType.EVENT) {
            eventsToPut.push({
                EventBusName: EVENT_BUS_NAME,
                DetailType: 'BUS_EVENT',
                Detail: JSON.stringify(busMessage),
            })
        }

        if (item.bus === OutboxBusType.COMMAND) {
            commandsToPublish.push({
                Id: v4(),
                MessageAttributes: {
                    type: { StringValue: busMessage.type, DataType: 'String' },
                },
                Message: JSON.stringify(busMessage),
            })
        }
    }

    for (const record of event.Records) {
        if (isSqsRecord(record)) {
            forwardOutboxItem(JSON.parse(record.body))
        }

        if (isDynamoRecord(record)) {
            if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
                forwardOutboxItem(unmarshall(record.dynamodb?.NewImage as any) as OutboxItem)
            }
        }
    }

    console.log('eventsToPut', eventsToPut)
    console.log('commandsToPublish', commandsToPublish)

    if (eventsToPut.length) {
        await eventBridgeClient.send(
            new PutEventsCommand({
                Entries: eventsToPut,
            })
        )
    }

    if (commandsToPublish.length) {
        await snsClient.send(
            new PublishBatchCommand({
                TopicArn: COMMAND_BUS_ARN,
                PublishBatchRequestEntries: commandsToPublish,
            })
        )
    }
}
