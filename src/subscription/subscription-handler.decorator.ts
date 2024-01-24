import { ObjectSchema, symbol } from 'valibot'
import { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from 'aws-lambda'
import 'reflect-metadata'
import { addSubscriptionHandler, removeSubscriptionHandler, subscriptionHandler } from './subscription.handler'
import { isHttpEvent } from '../util/is-http-event'
import { SNSEvent } from 'aws-lambda/trigger/sns'
import { isSnsEvent } from '../util/is-sns-event'
import { Type } from '../util/type'

const SUBSCRIPTION_HANDLER_METADATA = symbol('SUBSCRIPTION_HANDLER_METADATA')

export type SubscriptionHandlerProps = {
    on: Type
    lookupKey: string
    route: string
    filterSchema?: ObjectSchema<any>
}

export const SubscriptionHandler = (props: SubscriptionHandlerProps): ClassDecorator => {
    return (constructor: any) => {
        Reflect.defineMetadata(SUBSCRIPTION_HANDLER_METADATA, props, constructor)

        constructor.prototype.subscriptionHandler = async (event: APIGatewayProxyEvent | SNSEvent) => {
            const instance = new constructor()

            if (isHttpEvent(event)) {
                console.log(`[HTTP EVENT] - ${JSON.stringify(event, null, 2)}`)

                if (event.requestContext.routeKey === `${props.route}.sub`) {
                    return addSubscriptionHandler(instance, props, event as APIGatewayProxyEvent)
                }

                if (event.requestContext.routeKey === `${props.route}.unsub`) {
                    return removeSubscriptionHandler(instance, props, event as APIGatewayProxyEvent)
                }

                return {
                    statusCode: 400,
                    body: 'invalid route',
                }
            }

            if (isSnsEvent(event)) {
                console.log(`[SNS EVENT] - ${JSON.stringify(event, null, 2)}`)
                return subscriptionHandler(instance, props, event)
            }

            return
        }
    }
}

export const getSubscriptionHandlerProps = (handler: any): SubscriptionHandlerProps => {
    const metadata = Reflect.getMetadata(SUBSCRIPTION_HANDLER_METADATA, handler)

    if (!metadata) throw new Error(`failed to get metadata for ${handler.name}`)

    return metadata
}
