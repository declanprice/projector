import { DynamoDBStreamEvent } from 'aws-lambda'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { AggregateItem } from '../../aggregate/aggregate.item'
import { EventBridgeClient, PutEventsCommand, PutEventsRequestEntry } from '@aws-sdk/client-eventbridge'
import { AttributeValue } from 'aws-lambda/trigger/dynamodb-stream'
import { ChangeEvent, ChangeType } from '../../event'

const client = new EventBridgeClient()

export const aggregateStorePublisherHandler = async (event: DynamoDBStreamEvent) => {
    const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME

    const changeEventsToPut: PutEventsRequestEntry[] = []

    for (const record of event.Records) {
        if (!record.eventName) continue

        let image: Record<string, AttributeValue> = {}

        if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
            image = record.dynamodb?.NewImage!
        }

        if (record.eventName === 'REMOVE') {
            image = record.dynamodb?.OldImage!
        }

        if (!record.dynamodb?.NewImage) continue

        const data = unmarshall(image as any) as AggregateItem<any>

        const changeEvent: ChangeEvent<any> = {
            type: data.type,
            data: data.data,
            timestamp: data.timestamp,
            change: record.eventName as ChangeType,
        }

        changeEventsToPut.push({
            EventBusName: EVENT_BUS_NAME,
            DetailType: 'CHANGE_EVENT',
            Source: record.eventSource || '',
            Detail: JSON.stringify(changeEvent),
        })
    }

    console.log('changeEventsToPut', changeEventsToPut)

    if (changeEventsToPut.length) {
        // todo - error handling for when events fail to put
        const response = await client.send(
            new PutEventsCommand({
                Entries: changeEventsToPut,
            })
        )

        console.log('response', response)
    }
}
