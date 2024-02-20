import { EventBridgeEvent, SQSEvent } from 'aws-lambda'
import { EventGroupProps, getEventHandlerMethod } from './event-group.decorator'
import { EventMessage } from './event-message.type'

export const eventGroupHandler = async (instance: any, props: EventGroupProps, event: SQSEvent) => {
    for (const record of event.Records) {
        const body = JSON.parse(record.body) as EventBridgeEvent<any, EventMessage<any>>

        const { detail } = body

        const method = getEventHandlerMethod(instance.constructor, detail.type)

        if (!method) {
            throw new Error(`@EventHandler for ${detail.type} does not exist on ${instance.constructor.name}`)
        }

        await instance[method](detail)
    }
}
