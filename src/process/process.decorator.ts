import { symbol } from 'valibot'
import { SQSEvent } from 'aws-lambda'
import { Type } from '../util/type'
import { processHandler } from './process.handler'

const PROCESS_PROPS = symbol('PROCESS_PROPS')
const PROCESS_EVENT_TYPES = symbol('PROCESS_EVENT_TYPES')

export type ProcessProps = {
    defaultKey: string
    batchSize?: number
}

export type ProcessHandlerProps = {
    start?: boolean
    key?: string
}

export type ProcessHandlerMetadata = {
    method: string | symbol
} & ProcessHandlerProps

export const Process = (props: ProcessProps): ClassDecorator => {
    return (constructor: any) => {
        Reflect.defineMetadata(PROCESS_PROPS, props, constructor)

        constructor.prototype.processHandler = (event: SQSEvent) => {
            return processHandler(new constructor(), props, event)
        }
    }
}

export const ProcessHandler = (event: Type, props?: ProcessHandlerProps): MethodDecorator => {
    return (target: any, method: string | symbol) => {
        const handlerMetadata: ProcessHandlerMetadata = {
            ...props,
            method,
        }

        Reflect.defineMetadata(event.name, handlerMetadata, target.constructor)

        const eventTypes = getProcessEventTypes(target.constructor)

        eventTypes.push(event.name)

        Reflect.defineMetadata(PROCESS_EVENT_TYPES, eventTypes, target.constructor)
    }
}

export const StartProcess = (event: Type, props?: ProcessHandlerProps): MethodDecorator => {
    return ProcessHandler(event, {
        ...props,
        start: true,
    })
}

export const getProcessProps = (target: any): ProcessProps => {
    return Reflect.getMetadata(PROCESS_PROPS, target)
}

export const getProcessEventTypes = (target: any): string[] => {
    const eventTypes = Reflect.getMetadata(PROCESS_EVENT_TYPES, target)

    if (!eventTypes) return []

    return eventTypes
}

export const getProcessHandlerProps = (eventType: string, target: any): ProcessHandlerMetadata => {
    return Reflect.getMetadata(eventType, target)
}
