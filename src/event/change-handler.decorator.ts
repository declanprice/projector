import { SQSEvent } from 'aws-lambda'
import { Type } from '../util/type'
import { symbol } from 'valibot'
import 'reflect-metadata'
import { ChangeType } from './change-event.type'
import { changeHandler } from './change.handler'
import { AggregateItem } from '../store/aggregate/aggregate.item'

const CHANGE_HANDLER_GROUP = symbol('CHANGE_HANDLER_GROUP')

const CHANGE_HANDLER_GROUP_TYPES = symbol('CHANGE_HANDLER_GROUP_TYPES')

export type ChangeHandlerGroupProps = {
    batchSize?: number
}

export const ChangeHandlerGroup = (props: ChangeHandlerGroupProps): ClassDecorator => {
    return (constructor: any) => {
        Reflect.defineMetadata(CHANGE_HANDLER_GROUP, props, constructor)

        constructor.prototype.changeHandler = (event: SQSEvent) => {
            console.log(`[CHANGE HANDLER EVENT] - ${JSON.stringify(event, null, 2)}`)
            return changeHandler(new constructor(), props, event)
        }
    }
}

export const getChangeHandlerGroupTypes = (target: any): { type: string; change: ChangeType }[] => {
    const changeTypes = Reflect.getMetadata(CHANGE_HANDLER_GROUP_TYPES, target)

    if (!changeTypes) return []

    return changeTypes
}

export const getChangeHandlerGroupProps = (target: any): ChangeHandlerGroupProps => {
    return Reflect.getMetadata(CHANGE_HANDLER_GROUP, target)
}

export const ChangeHandler = (type: Type<AggregateItem>, change: ChangeType): MethodDecorator => {
    return (target: any, propertyKey: string | symbol) => {
        Reflect.defineMetadata(`${type.name}-${change}`, propertyKey, target.constructor)

        const changeTypes = getChangeHandlerGroupTypes(target.constructor)

        changeTypes.push({
            type: type.name,
            change,
        })

        Reflect.defineMetadata(CHANGE_HANDLER_GROUP_TYPES, changeTypes, target.constructor)
    }
}

export const getChangeHandlerMethod = (target: any, type: string, change: ChangeType): string => {
    return Reflect.getMetadata(`${type}-${change}`, target)
}
