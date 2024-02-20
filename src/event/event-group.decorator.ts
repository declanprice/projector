import { SQSEvent } from 'aws-lambda'
import { symbol } from 'valibot'
import 'reflect-metadata'
import { eventGroupHandler } from './event-group.handler'
import { Type } from '../util/type'

const EVENT_GROUP = symbol('EVENT_GROUP')

const EVENT_GROUP_TYPES = symbol('EVENT_GROUP_TYPES')

export type EventGroupProps = {
    batchSize?: number
}

export const EventGroup = (props: EventGroupProps): ClassDecorator => {
    return (constructor: any) => {
        Reflect.defineMetadata(EVENT_GROUP, props, constructor)

        constructor.prototype.eventGroupHandler = (event: SQSEvent) => {
            console.log(`[EVENT-GROUP EVENT] - ${JSON.stringify(event, null, 2)}`)
            return eventGroupHandler(new constructor(), props, event)
        }
    }
}

export const getEventGroupTypes = (target: any): string[] => {
    const changeTypes = Reflect.getMetadata(EVENT_GROUP_TYPES, target)

    if (!changeTypes) return []

    return changeTypes
}

export const getEventGroupProps = (target: any): EventGroupProps => {
    return Reflect.getMetadata(EVENT_GROUP, target)
}

export const EventHandler = (eventTypes: string[] | string): MethodDecorator => {
    return (target: any, propertyKey: string | symbol) => {
        const currentEventTypes = getEventGroupTypes(target.constructor)

        const registerType = (type: string) => {
            Reflect.defineMetadata(type, propertyKey, target.constructor)

            currentEventTypes.push(type)
        }

        if (Array.isArray(eventTypes)) {
            for (const eventType of eventTypes) {
                registerType(eventType)
            }
        } else {
            registerType(eventTypes)
        }

        Reflect.defineMetadata(EVENT_GROUP_TYPES, currentEventTypes, target.constructor)
    }
}

export const getEventHandlerMethod = (target: any, type: string): string => {
    return Reflect.getMetadata(type, target)
}
