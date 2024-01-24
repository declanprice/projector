import { SubscriptionHandlerProps } from './subscription-handler.decorator'
import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { SNSEvent } from 'aws-lambda/trigger/sns'
import { SubscriptionItem } from '../store/subscription/subscription.item'

export type HandleSubscription<Update, Filter> = {
    onAdd?: (connection: Filter) => Promise<any>
    onRemove?: (connection: Filter) => Promise<any>
    filter?: (update: Update, connection: Filter) => boolean
    handle: (update: Update) => Promise<any>
}

export const addSubscriptionHandler = async (
    instance: HandleSubscription<any, any>,
    props: SubscriptionHandlerProps,
    event: APIGatewayProxyEventV2
) => {
    console.log('subscription add handler')
    if (instance.onAdd) {
        await instance.onAdd({} as any)
    }
}

export const removeSubscriptionHandler = async (
    instance: HandleSubscription<any, any>,
    props: SubscriptionHandlerProps,
    event: APIGatewayProxyEventV2
) => {
    console.log('subscription remove handler')
    if (instance.onRemove) {
        await instance.onRemove({} as any)
    }
}

export const subscriptionHandler = async (
    instance: HandleSubscription<any, any>,
    props: SubscriptionHandlerProps,
    event: SNSEvent
) => {
    console.log('subscription handler')

    for (const record of event.Records) {
        await instance.handle({})
    }
}
