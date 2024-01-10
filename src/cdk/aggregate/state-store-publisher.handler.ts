import { DynamoDBStreamEvent } from 'aws-lambda'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { AggregateItem } from '../../aggregate/aggregate.item'
import { EventBridgeClient, PutEventsCommand, PutEventsRequestEntry } from '@aws-sdk/client-eventbridge'

const client = new EventBridgeClient()

export const stateStorePublisherHandler = async (event: DynamoDBStreamEvent) => {
    const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME

    const eventsToPut: PutEventsRequestEntry[] = []

    for (const record of event.Records) {
        if ((record.eventName === 'INSERT' || record.eventName === 'MODIFY') && record.dynamodb?.NewImage !== undefined) {
            const data = unmarshall(record.dynamodb.NewImage as any) as AggregateItem

            eventsToPut.push({
                EventBusName: EVENT_BUS_NAME,
                DetailType: data.lastEvent.type,
                Source: record.eventSource || '',
                Detail: JSON.stringify(data),
            })
        }

        if (record.eventName === 'REMOVE') {
            console.log('REMOVE item event not supported')
        }
    }

    console.log('eventsToPut', eventsToPut)

    // todo - error handling for when events fail to put
    const response = await client.send(
        new PutEventsCommand({
            Entries: eventsToPut,
        })
    )

    console.log('response', response)
}
