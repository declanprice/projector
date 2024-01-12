import { SQSEvent } from 'aws-lambda'
import { eventHandler } from './event.handler'
import { Type } from '../util/type'
import { symbol } from 'valibot'
import 'reflect-metadata'
import { ChangeType } from './change-event.type'
import { changeHandler } from './change.handler'

const CHANGE_HANDLER_METADATA = symbol('CHANGE_HANDLER_METADATA')

const CHANGE_TYPES_METADATA = symbol('CHANGE_TYPES_METADATA')

export type ChangeHandlerGroupProps = {
    batchSize?: number
}

export const ChangeHandlerGroup = (props: ChangeHandlerGroupProps): ClassDecorator => {
    return (constructor: any) => {
        Reflect.defineMetadata(CHANGE_HANDLER_METADATA, props, constructor)

        constructor.prototype.changeHandler = (event: SQSEvent) => {
            return changeHandler(new constructor(), props, event)
        }
    }
}

export const getChangeHandlerGroupProps = (target: any): ChangeHandlerGroupProps => {
    return Reflect.getMetadata(CHANGE_HANDLER_METADATA, target)
}

export const ChangeHandler = (type: Type, change: ChangeType): MethodDecorator => {
    return (target: any, propertyKey: string | symbol) => {
        Reflect.defineMetadata(`${type}-${change}`, propertyKey, target.constructor)

        const changeTypes = getChangeTypes(target.constructor)

        changeTypes.push({
            type: type.name,
            change,
        })

        Reflect.defineMetadata(CHANGE_TYPES_METADATA, changeTypes, target.constructor)
    }
}

export const getChangeHandlerMethod = (target: any, type: string, change: ChangeType): string => {
    return Reflect.getMetadata(`${type}-${change}`, target)
}

export const getChangeTypes = (target: any): { type: string; change: ChangeType }[] => {
    const changeTypes = Reflect.getMetadata(CHANGE_TYPES_METADATA, target)

    if (!changeTypes) return []

    return changeTypes
}
