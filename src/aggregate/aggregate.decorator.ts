import { Type } from '../util/type'
import { symbol } from 'valibot'
import 'reflect-metadata'
const AGGREGATE_METADATA = symbol('AGGREGATE_METADATA')

export enum AggregateType {
    STATE_STORED,
    EVENT_STORED,
}

type AggregateDecoratorProps = {
    type: AggregateType
    snapshotPeriod?: number
}

export const Aggregate = (props: AggregateDecoratorProps): ClassDecorator => {
    return (target: Function) => {
        Reflect.defineMetadata(AGGREGATE_METADATA, props, target)
    }
}

export const getAggregateProps = (target: any): AggregateDecoratorProps => {
    return Reflect.getMetadata(AGGREGATE_METADATA, target)
}

export const AggregateId = (): PropertyDecorator => {
    return (target, propertyKey) => {}
}

export const AggregateHandler = (event: Type): MethodDecorator => {
    return (target, propertyKey) => {}
}
