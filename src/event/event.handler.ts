import { EventBridgeEvent, SQSEvent } from 'aws-lambda'
import { EventHandlerProps, getEventHandlerProps } from './event-handler.decorator'
import { EventMessage } from './event-bus-message.type'

export const eventHandler = async (instance: any, props: EventHandlerProps, event: SQSEvent) => {
    for (const record of event.Records) {
        const body = JSON.parse(record.body) as EventBridgeEvent<any, EventMessage<any>>

        const { detail } = body

        const method = getEventHandlerProps(instance.constructor, detail.type)

        if (!method) {
            throw new Error(`@EventHandler for event ${detail.type} does not exist on ${instance.constructor.name}`)
        }

        await instance[method](detail)
    }
}
