import { Type } from 'aws-cdk-lib/assertions/lib/private/type'

type ProcessHandlerProps = {}

export const ProcessHandler = (event: Type, props?: ProcessHandlerProps): MethodDecorator => {
    return (object: Object, propertyKey: string | symbol) => {}
}
