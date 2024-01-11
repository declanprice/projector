import { EventBridgeEvent, SQSEvent } from 'aws-lambda'
import { EventHandlerProps, getEventHandlerProps } from './event-handler.decorator'
import { AggregateItem } from '../aggregate/aggregate.item'

export const eventHandler = async (instance: any, props: EventHandlerProps, event: SQSEvent) => {
    console.log(event)

    for (const record of event.Records) {
        const body = JSON.parse(record.body) as EventBridgeEvent<any, AggregateItem>

        const { detail } = body

        const method = getEventHandlerProps(instance.constructor, detail.lastEvent.type)

        if (!method) {
            throw new Error(`@EventHandler for event ${detail.lastEvent.type} does not exist on ${instance.constructor.name}`)
        }

        await instance[method](detail.lastEvent.data, detail)
    }
}
