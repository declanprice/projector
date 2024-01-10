type ProjectionDecoratorProps = {}

export const Projection = (props?: ProjectionDecoratorProps): ClassDecorator => {
    return (target: Function) => {}
}

export const ProjectionId = (): PropertyDecorator => {
    return (target, propertyKey) => {}
}
