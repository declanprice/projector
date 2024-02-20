import { EventBridgeEvent, SQSEvent } from 'aws-lambda'
import { ChangeGroupProps, getChangeHandlerMethod } from './change-group.decorator'
import { ChangeMessage } from './change-message.type'

export const changeGroupHandler = async (instance: any, props: ChangeGroupProps, event: SQSEvent) => {
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
