import { ObjectSchema, symbol } from 'valibot'
import { SQSEvent } from 'aws-lambda'
import 'reflect-metadata'
import { subscriptionHandler } from './subscription.handler'
import { isHttpEvent } from '../util/is-http-event'
import { isSqsEvent } from '../util/is-sqs-event'

const SUBSCRIPTION_HANDLER_METADATA = symbol('SUBSCRIPTION_HANDLER_METADATA')

export type SubscriptionHandlerProps = {
    route: string
    schema?: ObjectSchema<any>
}

export const SubscriptionHandler = (props: SubscriptionHandlerProps): ClassDecorator => {
    return (constructor: any) => {
        Reflect.defineMetadata(SUBSCRIPTION_HANDLER_METADATA, props, constructor)

        constructor.prototype.subscriptionHandler = async (event: SQSEvent) => {
            const instance = new constructor()

            if (isHttpEvent(event)) {
                console.log('http event')
            }

            if (isSqsEvent(event)) {
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
