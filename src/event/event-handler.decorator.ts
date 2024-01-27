import { SQSEvent } from 'aws-lambda'
import { eventHandler } from './event.handler'
import { Type } from '../util/type'
import { symbol } from 'valibot'
import 'reflect-metadata'
import { Event } from '../store/event/event'

const EVENT_HANDLER_GROUP = symbol('EVENT_HANDLER_GROUP')

const EVENT_HANDLER_GROUP_TYPES = symbol('EVENT_HANDLER_GROUP_TYPES')

export type EventHandlerProps = {
    batchSize?: number
}

export const EventHandlerGroup = (props: EventHandlerProps): ClassDecorator => {
    return (constructor: any) => {
        Reflect.defineMetadata(EVENT_HANDLER_GROUP, props, constructor)

        constructor.prototype.eventHandler = (event: SQSEvent) => {
            console.log(`[EVENT HANDLER EVENT] - ${JSON.stringify(event, null, 2)}`)
            return eventHandler(new constructor(), props, event)
        }
    }
}

export const getEventHandlerGroupTypes = (target: any): string[] => {
    const eventNames = Reflect.getMetadata(EVENT_HANDLER_GROUP_TYPES, target) as string[]

    if (!eventNames) return []

    return eventNames
}

export const getEventHandlerGroupProps = (target: any): EventHandlerProps => {
    return Reflect.getMetadata(EVENT_HANDLER_GROUP, target)
}

export const EventHandler = (type: string): MethodDecorator => {
    return (target: any, propertyKey: string | symbol) => {
        Reflect.defineMetadata(type, propertyKey, target.constructor)

        const eventNames = getEventHandlerGroupTypes(target.constructor)

        eventNames.push(type)

        Reflect.defineMetadata(EVENT_HANDLER_GROUP_TYPES, eventNames, target.constructor)
    }
}

export const getEventHandlerProps = (target: any, eventName: string): string => {
    return Reflect.getMetadata(eventName, target)
}
