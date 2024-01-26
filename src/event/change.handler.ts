import { EventBridgeEvent, SQSEvent } from 'aws-lambda'
import { ChangeHandlerGroupProps, getChangeHandlerMethod } from './change-handler.decorator'
import { ChangeMessage } from './change-event.type'

export const changeHandler = async (instance: any, props: ChangeHandlerGroupProps, event: SQSEvent) => {
    for (const record of event.Records) {
        const body = JSON.parse(record.body) as EventBridgeEvent<any, ChangeMessage<any>>

        const { detail } = body

        const method = getChangeHandlerMethod(instance.constructor, detail.type, detail.change)

        if (!method) {
            throw new Error(
                `@ChangeHandler for ${detail.type} ${detail.change} does not exist on ${instance.constructor.name}`
            )
        }

        await instance[method](detail)
    }
}
