import { SubscriptionHandlerProps } from './subscription-handler.decorator'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { SNSEvent } from 'aws-lambda/trigger/sns'
import { parse } from 'valibot'
import { SubscriptionStore } from '../store/subscription/subscription.store'
import { ApiGatewayManagementApi, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi'
import { SubscriptionItem } from '../store/subscription/subscription.item'

export type HandleSubscription = {
    onSub?: () => Promise<any>
    onUnsub?: () => Promise<any>
    filter?: (update: any, filter: any) => boolean
    handle: (update: any) => Promise<any>
}

const store = new SubscriptionStore()

const SUBSCRIPTION_API_ENDPOINT = process.env.SUBSCRIPTION_API_ENDPOINT

const subscriptionApi = new ApiGatewayManagementApi({
    endpoint: `https://${SUBSCRIPTION_API_ENDPOINT}`,
})

export const addSubscriptionHandler = async (
    instance: HandleSubscription,
    props: SubscriptionHandlerProps,
    event: APIGatewayProxyEvent
) => {
    const connectionId = event.requestContext.connectionId!
    const claims = event.requestContext.authorizer?.claims || {}
    const body = JSON.parse(event?.body || '')
    const filter = body?.filter || {}

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

    const lookupKey = filter[props.lookupKey]

    if (!lookupKey) {
        return {
            statusCode: 400,
            body: `body must contain lookupKey ${props.lookupKey}`,
        }
    }

    await store.sub(connectionId, `${instance.constructor.name}`, lookupKey, filter).exec()

    return {
        statusCode: 200,
        body: 'ok',
    }
}

export const removeSubscriptionHandler = async (
    instance: HandleSubscription,
    props: SubscriptionHandlerProps,
    event: APIGatewayProxyEvent
) => {
    const connectionId = event.requestContext.connectionId!
    const body = JSON.parse(event?.body || '')
    const filter = body?.filter || {}
    const lookupKey = filter[props.lookupKey]
    if (!lookupKey) {
        return {
            statusCode: 400,
            body: `filter must contain lookupKey ${props.lookupKey}`,
        }
    }

    if (instance.onUnsub) {
        await instance.onUnsub()
    }

    await store.unsub(connectionId, `${instance.constructor.name}`, lookupKey).exec()

    return {
        statusCode: 200,
        body: 'ok',
    }
}

export const subscriptionHandler = async (
    instance: HandleSubscription,
    props: SubscriptionHandlerProps,
    event: SNSEvent
) => {
    for (const record of event.Records) {
        const body = JSON.parse(record.Sns.Message)
        const data = body.data
        const lookupKey = data[props.lookupKey]
        if (!lookupKey) {
            console.log(`[LOOKUP KEY MISSING] - update body does not contain lookupKey ${props.lookupKey}`)
            continue
        }

        const response = await store.querySubsByLookupKey(instance.constructor.name, lookupKey).exec()

        console.log(`[SUBS FOUND] - ${response.items.length} subscriptions found using lookupKey ${lookupKey}`)

        let subscriptions = response.items as SubscriptionItem[]

        if (instance.filter) {
            subscriptions.filter((sub) => {
                return (instance as any).filter(data, sub.filter)
            })
        }

        console.log(`[EMITTING UPDATE TO SUBS] - emitting update to ${subscriptions.length} subscriptions`)

        for (const sub of subscriptions) {
            const result = await instance.handle(data)
            await subscriptionApi.send(
                new PostToConnectionCommand({
                    ConnectionId: sub.connectionId,
                    Data: Buffer.from(
                        JSON.stringify({
                            type: props.route,
                            data: result,
                        })
                    ),
                })
            )
        }
    }
}
