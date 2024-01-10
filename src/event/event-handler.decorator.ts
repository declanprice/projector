import { SQSEvent } from 'aws-lambda'
import { eventHandler } from './event.handler'
import { Type } from '../util/type'
import { symbol } from 'valibot'
import 'reflect-metadata'

const EVENT_HANDLER_METADATA = symbol('EVENT_HANDLER_METADATA')

export type EventHandlerProps = {
    on: Type[]
}

export const EventHandler = (props: EventHandlerProps): ClassDecorator => {
    return (constructor: any) => {
        Reflect.defineMetadata(EVENT_HANDLER_METADATA, props, constructor)

        constructor.prototype.eventHandler = (event: SQSEvent) => {
            return eventHandler(new constructor(), props, event)
        }
    }
}

export const getEventHandlerProps = (target: any): EventHandlerProps => {
    return Reflect.getMetadata(EVENT_HANDLER_METADATA, target)
}
