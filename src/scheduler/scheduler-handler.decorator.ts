import { SQSEvent } from 'aws-lambda'
import { schedulerHandler } from './scheduler.handler'
import { symbol } from 'valibot'
import 'reflect-metadata'

const SCHEDULED_TASK_HANDLER_TYPE = symbol('SCHEDULED_TASK_HANDLER_TYPE')

const SCHEDULED_TASK_HANDLER_PROPS = symbol('SCHEDULED_TASK_HANDLER_PROPS')

export type SchedulerHandlerProps = {
    batchSize?: number
}

export const SchedulerHandler = (type: string, props: SchedulerHandlerProps): ClassDecorator => {
    return (constructor: any) => {
        Reflect.defineMetadata(SCHEDULED_TASK_HANDLER_TYPE, type, constructor)
        Reflect.defineMetadata(SCHEDULED_TASK_HANDLER_PROPS, props, constructor)

        constructor.prototype.schedulerHandler = (event: SQSEvent) => {
            console.log(`[SCHEDULED TASK HANDLER] - ${JSON.stringify(event, null, 2)}`)
            return schedulerHandler(new constructor(), props, event)
        }
    }
}

export const getSchedulerHandlerType = (target: any): string => {
    return Reflect.getMetadata(SCHEDULED_TASK_HANDLER_TYPE, target) as string
}

export const getSchedulerHandlerProps = (target: any): SchedulerHandlerProps => {
    return Reflect.getMetadata(SCHEDULED_TASK_HANDLER_PROPS, target)
}
