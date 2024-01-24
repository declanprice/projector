import { SubscriptionHandlerProps } from './subscription-handler.decorator'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { SNSEvent } from 'aws-lambda/trigger/sns'
import { parse } from 'valibot'
import { SubscriptionStore } from '../store/subscription/subscription.store'

export type HandleSubscription<Update, Filter> = {
    onSub?: () => Promise<any>
    onUnsub?: () => Promise<any>
    filter?: (update: Update, filter: Filter) => boolean
    handle: (update: Update) => Promise<any>
}

const store = new SubscriptionStore()

export const addSubscriptionHandler = async (
    instance: HandleSubscription<any, any>,
    props: SubscriptionHandlerProps,
    event: APIGatewayProxyEvent
) => {
    const connectionId = event.requestContext.connectionId!
    const claims = event.requestContext.authorizer?.claims || {}

    let parsedFilter: any

    if (props.filterSchema) {
        try {
            const body = JSON.stringify(event.body) as any
            parsedFilter = parse(props.filterSchema, body?.filter)
        } catch (error) {
            return {
                statusCode: 400,
                body: 'filter failed schema validation.',
            }
        }
    }

    try {
        if (instance.onSub) {
            await instance.onSub()
        }
    } catch (error) {
        return {
            statusCode: 400,
            body: 'onSub guard failed.',
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify(parsedFilter),
    }
}

export const removeSubscriptionHandler = async (
    instance: HandleSubscription<any, any>,
    props: SubscriptionHandlerProps,
    event: APIGatewayProxyEvent
) => {
    console.log('subscription remove handler')

    if (instance.onUnsub) {
        await instance.onUnsub()
    }

    return {
        statusCode: 200,
        body: 'ok',
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
