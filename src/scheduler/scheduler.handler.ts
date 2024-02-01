import { EventBridgeEvent, SQSEvent } from 'aws-lambda'
import { SchedulerMessage } from './scheduler-message.type'
import { SchedulerHandlerProps } from './scheduler-handler.decorator'

export type HandleSchedule = {
    handle(message: SchedulerMessage<any>): Promise<void>
}

export const schedulerHandler = async (instance: HandleSchedule, props: SchedulerHandlerProps, event: SQSEvent) => {
    for (const record of event.Records) {
        const body = JSON.parse(record.body) as EventBridgeEvent<any, SchedulerMessage<any>>

        const { detail } = body

        await instance.handle(detail)
    }
}
