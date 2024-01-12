import { SubscriptionHandlerProps } from './subscription-handler.decorator'
import { APIGatewayProxyEventV2, SQSEvent } from 'aws-lambda'
import { SNSEvent } from 'aws-lambda/trigger/sns'

export type HandleSubscription = {
    onAdd: () => Promise<any>
    onRemove: () => Promise<any>
    filter?: (update: any, connection: any) => boolean
    handle: (update: any) => Promise<any>
}

export const addSubscriptionHandler = async (
    instance: HandleSubscription,
    props: SubscriptionHandlerProps,
    event: APIGatewayProxyEventV2
) => {
    console.log('subscription add handler')
    await instance.onAdd()
}

export const removeSubscriptionHandler = async (
    instance: HandleSubscription,
    props: SubscriptionHandlerProps,
    event: APIGatewayProxyEventV2
) => {
    console.log('subscription remove handler')
    await instance.onRemove()
}

export const subscriptionHandler = async (
    instance: HandleSubscription,
    props: SubscriptionHandlerProps,
    event: SNSEvent
) => {
    console.log('subscription handler')

    for (const record of event.Records) {
        await instance.handle({})
    }
}
