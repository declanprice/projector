import { symbol } from 'valibot'

const PROJECTION_ID_PROPERTY = symbol('PROJECTION_ID_PROPERTY')

type ProjectionProps = {}

export const Projection = (props?: ProjectionProps): ClassDecorator => {
    return (target: Function) => {}
}

export const ProjectionId = (): PropertyDecorator => {
    return (target, propertyKey) => {
        Reflect.defineMetadata(PROJECTION_ID_PROPERTY, propertyKey, target)
    }
}

export const getProjectionId = (target: any) => {
    return Reflect.getMetadata(PROJECTION_ID_PROPERTY, target)
}
