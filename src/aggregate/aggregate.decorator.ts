import { Type } from '../util/type'
import { symbol } from 'valibot'
import 'reflect-metadata'

const AGGREGATE_METADATA = symbol('AGGREGATE_METADATA')

const AGGREGATE_ID_PROPERTY = symbol('AGGREGATE_ID_PROPERTY')

type AggregateDecoratorProps = {}

export const Aggregate = (props?: AggregateDecoratorProps): ClassDecorator => {
    return (target: Function) => {
        Reflect.defineMetadata(AGGREGATE_METADATA, props, target)
    }
}

export const getAggregateProps = (target: any): AggregateDecoratorProps => {
    return Reflect.getMetadata(AGGREGATE_METADATA, target)
}

export const AggregateId = (): PropertyDecorator => {
    return (target, propertyKey) => {
        Reflect.defineMetadata(AGGREGATE_ID_PROPERTY, propertyKey, target)
    }
}

export const getAggregateId = (target: any) => {
    return Reflect.getMetadata(AGGREGATE_ID_PROPERTY, target)
}

export const AggregateHandler = (event: Type): MethodDecorator => {
    return (target, propertyKey) => {
        Reflect.defineMetadata(event.name, propertyKey, target)
    }
}

export const getAggregateHandler = (target: any, eventName: string) => {
    return Reflect.getMetadata(eventName, target)
}
