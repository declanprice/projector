import { EventBridgeEvent, SQSEvent } from 'aws-lambda'
import { Type } from '../util/type'
import { processHandler } from './process.handler'
import { processAssociationsHandler } from './process-associations.handler'

export type ProcessDecoratorProps = {
    batchSize?: number
    defaultKey?: string
}

export const Process = (props: ProcessDecoratorProps): ClassDecorator => {
    return (constructor: any) => {
        constructor.prototype.processHandler = (event: SQSEvent) => {
            return processHandler(new constructor(), props, event)
        }

        constructor.prototype.processAssociationHandler = (event: EventBridgeEvent<any, any>) => {
            return processAssociationsHandler(new constructor(), props, event)
        }
    }
}

type ProcessHandlerProps = {}

export const ProcessHandler = (event: Type, props?: ProcessHandlerProps): MethodDecorator => {
    return (object: Object, propertyKey: string | symbol) => {}
}

export const StartProcess = (event: Type, props?: ProcessHandlerProps): MethodDecorator => {
    return (object: Object, propertyKey: string | symbol) => {}
}

export const EndProcess = (event: Type, props?: ProcessHandlerProps): MethodDecorator => {
    return (object: Object, propertyKey: string | symbol) => {}
}
