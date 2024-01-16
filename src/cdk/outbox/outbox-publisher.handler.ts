import { DynamoDBStreamEvent, SQSEvent } from 'aws-lambda'
import { EventBridgeClient, PutEventsCommand, PutEventsRequestEntry } from '@aws-sdk/client-eventbridge'
import { PublishBatchCommand, PublishBatchRequestEntry, SNSClient } from '@aws-sdk/client-sns'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { v4 } from 'uuid'
import { isSqsRecord } from '../../util/is-sqs-event'
import { isDynamoEvent } from '../../util/is-dynamo-event'
import { OutboxBusType, OutboxItem } from '../../outbox/outbox.item'
import { EventBusMessage } from '../../event'
import { CommandBusMessage } from '../../command'

const eventBridgeClient = new EventBridgeClient()
const snsClient = new SNSClient()

export const outboxPublisherHandler = async (event: DynamoDBStreamEvent | SQSEvent) => {
    const COMMAND_BUS_ARN = process.env.COMMAND_BUS_ARN as string
    const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME as string

    const eventsToPut: PutEventsRequestEntry[] = []
    const commandsToPublish: PublishBatchRequestEntry[] = []

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
    }

    for (const record of event.Records) {
        let item: OutboxItem | null = null

        if (isSqsRecord(record)) {
            item = JSON.parse(record.body) as OutboxItem
        }

        if (isDynamoEvent(record)) {
            if ((record.eventName === 'INSERT' || record.eventName === 'MODIFY') && record.dynamodb?.NewImage) {
                item = unmarshall(record.dynamodb.NewImage as any) as OutboxItem
            }

            if (record.eventName === 'REMOVE') {
                continue
            }
        }

        if (item === null) {
            throw new Error(`[Invalid Outbox Event] - ${JSON.stringify(event, null, 2)}`)
        }

        forwardOutboxItem(item)
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
