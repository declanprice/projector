import { ObjectSchema, symbol } from 'valibot'
import { APIGatewayProxyEventV2 } from 'aws-lambda'
import 'reflect-metadata'
import { subscriptionHandler } from './subscription.handler'
import { isHttpEvent } from '../util/is-http-event'
import { SNSEvent } from 'aws-lambda/trigger/sns'
import { isSnsEvent } from '../util/is-sns-event'
import { Type } from '../util/type'

const SUBSCRIPTION_HANDLER_METADATA = symbol('SUBSCRIPTION_HANDLER_METADATA')

export type SubscriptionHandlerProps = {
    on: Type
    lookupKey: string
    route: string
    schema?: ObjectSchema<any>
}

export const SubscriptionHandler = (props: SubscriptionHandlerProps): ClassDecorator => {
    return (constructor: any) => {
        Reflect.defineMetadata(SUBSCRIPTION_HANDLER_METADATA, props, constructor)

        constructor.prototype.subscriptionHandler = async (event: APIGatewayProxyEventV2 | SNSEvent) => {
            const instance = new constructor()

            if (isHttpEvent(event)) {
                console.log('http event')
            }

            if (isSnsEvent(event)) {
                await subscriptionHandler(instance, props, event)
            }
        }
    }
}

export const getSubscriptionHandlerProps = (handler: any): SubscriptionHandlerProps => {
    const metadata = Reflect.getMetadata(SUBSCRIPTION_HANDLER_METADATA, handler)

    if (!metadata) throw new Error(`failed to get metadata for ${handler.name}`)

    return metadata
}
