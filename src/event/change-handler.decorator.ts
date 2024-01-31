import { SQSEvent } from 'aws-lambda'
import { symbol } from 'valibot'
import 'reflect-metadata'
import { ChangeType } from './change-event.type'
import { changeHandler } from './change.handler'

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

export const ChangeHandler = (type: string, changeTypes: ChangeType | ChangeType[]): MethodDecorator => {
    return (target: any, propertyKey: string | symbol) => {
        const currentChangeTypes = getChangeHandlerGroupTypes(target.constructor)

        const registerType = (type: string, changeType: ChangeType) => {
            Reflect.defineMetadata(`${type}-${changeType}`, propertyKey, target.constructor)

            currentChangeTypes.push({
                type: type,
                change: changeType,
            })
        }

        if (Array.isArray(changeTypes)) {
            for (const changeType of changeTypes) {
                registerType(type, changeType)
            }
        } else {
            registerType(type, changeTypes)
        }

        Reflect.defineMetadata(CHANGE_HANDLER_GROUP_TYPES, currentChangeTypes, target.constructor)
    }
}

export const getChangeHandlerMethod = (target: any, type: string, change: ChangeType): string => {
    return Reflect.getMetadata(`${type}-${change}`, target)
}
