import { EventBridgeEvent, SQSEvent } from 'aws-lambda'
import { EventHandlerProps } from './event-handler.decorator'
import { AggregateItem } from '../aggregate/aggregate.item'

export type HandleEvent = {
    handle: (type: string, event: any, data: any) => Promise<any>
}

export const eventHandler = async (instance: HandleEvent, props: EventHandlerProps, event: SQSEvent) => {
    console.log(event)

    for (const record of event.Records) {
        const body = JSON.parse(record.body) as EventBridgeEvent<any, AggregateItem>

        const { detail } = body

        await instance.handle(detail.lastEvent.type, detail.lastEvent.data, detail)
    }
}
