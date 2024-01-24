import { SubscriptionHandlerProps } from './subscription-handler.decorator'
import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { SNSEvent } from 'aws-lambda/trigger/sns'
import { parse } from 'valibot'

export type HandleSubscription<Update, Filter> = {
    onAdd?: () => Promise<any>
    onRemove?: () => Promise<any>
    filter?: (update: Update, filter: Filter) => boolean
    handle: (update: Update) => Promise<any>
}

export const addSubscriptionHandler = async (
    instance: HandleSubscription<any, any>,
    props: SubscriptionHandlerProps,
    event: APIGatewayProxyEventV2
) => {
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

    if (instance.onAdd) {
        await instance.onAdd()
    }

    return {
        statusCode: 200,
        body: JSON.stringify(parsedFilter),
    }
}

export const removeSubscriptionHandler = async (
    instance: HandleSubscription<any, any>,
    props: SubscriptionHandlerProps,
    event: APIGatewayProxyEventV2
) => {
    console.log('subscription remove handler')

    if (instance.onRemove) {
        await instance.onRemove()
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
