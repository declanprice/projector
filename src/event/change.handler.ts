import { EventBridgeEvent, SQSEvent } from 'aws-lambda'
import { ChangeHandlerGroupProps, getChangeHandlerMethod } from './change-handler.decorator'
import { ChangeEvent } from './change-event.type'

export const changeHandler = async (instance: any, props: ChangeHandlerGroupProps, event: SQSEvent) => {
    console.log(event)

    for (const record of event.Records) {
        const body = JSON.parse(record.body) as EventBridgeEvent<any, ChangeEvent<any>>

        const { detail } = body

        const method = getChangeHandlerMethod(instance.constructor, body.detail.type, body.detail.change)

        if (!method) {
            throw new Error(
                `@ChangeHandler for ${detail.type} ${detail.change} does not exist on ${instance.constructor.name}`
            )
        }

        await instance[method](detail)
    }
}
