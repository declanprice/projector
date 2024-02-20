import { SQSEvent } from 'aws-lambda'
import { symbol } from 'valibot'
import 'reflect-metadata'
import { ChangeType } from './change-message.type'
import { changeGroupHandler } from './change-group.handler'

const CHANGE_GROUP = symbol('CHANGE_GROUP')

const CHANGE_GROUP_TYPES = symbol('CHANGE_GROUP_TYPES')

export type ChangeGroupProps = {
    batchSize?: number
}

export const ChangeGroup = (props: ChangeGroupProps): ClassDecorator => {
    return (constructor: any) => {
        Reflect.defineMetadata(CHANGE_GROUP, props, constructor)

        constructor.prototype.changeGroupHandler = (event: SQSEvent) => {
            console.log(`[CHANGE GROUP EVENT] - ${JSON.stringify(event, null, 2)}`)
            return changeGroupHandler(new constructor(), props, event)
        }
    }
}

export const getChangeGroupTypes = (target: any): { type: string; change: ChangeType }[] => {
    const changeTypes = Reflect.getMetadata(CHANGE_GROUP_TYPES, target)

    if (!changeTypes) return []

    return changeTypes
}

export const getChangeGroupProps = (target: any): ChangeGroupProps => {
    return Reflect.getMetadata(CHANGE_GROUP, target)
}

export const ChangeHandler = (type: string, changeTypes: ChangeType | ChangeType[]): MethodDecorator => {
    return (target: any, propertyKey: string | symbol) => {
        const currentChangeTypes = getChangeGroupTypes(target.constructor)

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

        Reflect.defineMetadata(CHANGE_GROUP_TYPES, currentChangeTypes, target.constructor)
    }
}

export const getChangeHandlerMethod = (target: any, type: string, change: ChangeType): string => {
    return Reflect.getMetadata(`${type}-${change}`, target)
}
