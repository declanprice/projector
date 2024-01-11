import { SQSEvent } from 'aws-lambda'
import { eventHandler } from './event.handler'
import { Type } from '../util/type'
import { symbol } from 'valibot'
import 'reflect-metadata'

const EVENT_HANDLER_METADATA = symbol('EVENT_HANDLER_METADATA')
const EVENT_NAMES_METADATA = symbol('EVENT_NAMES_METADATA')

export type EventHandlerProps = {
    batchSize?: number
}

export const EventHandlerGroup = (props: EventHandlerProps): ClassDecorator => {
    return (constructor: any) => {
        Reflect.defineMetadata(EVENT_HANDLER_METADATA, props, constructor)

        constructor.prototype.eventHandler = (event: SQSEvent) => {
            return eventHandler(new constructor(), props, event)
        }
    }
}

export const getEventHandlerGroupProps = (target: any): EventHandlerProps => {
    return Reflect.getMetadata(EVENT_HANDLER_METADATA, target)
}

export const EventHandler = (event: Type): MethodDecorator => {
    return (target: any, propertyKey: string | symbol) => {
        Reflect.defineMetadata(event.name, propertyKey, target.constructor)

        const eventNames = getEventNames(target.constructor)

        eventNames.push(event.name)

        Reflect.defineMetadata(EVENT_NAMES_METADATA, eventNames, target.constructor)
    }
}

export const getEventHandlerProps = (target: any, eventName: string): string => {
    return Reflect.getMetadata(eventName, target)
}

export const getEventNames = (target: any): string[] => {
    const eventNames = Reflect.getMetadata(EVENT_NAMES_METADATA, target) as string[]

    if (!eventNames) return []

    return eventNames
}
