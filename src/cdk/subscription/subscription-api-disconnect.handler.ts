import { APIGatewayProxyEvent } from 'aws-lambda'
import { SubscriptionStore } from '../../store/subscription/subscription.store'
import { commit } from '../../store/store-operations'

const store = new SubscriptionStore()

export const subscriptionApiDisconnectHandler = async (event: APIGatewayProxyEvent) => {
    console.log(`[ON DISCONNECT EVENT] - ${JSON.stringify(event, null, 2)})`)

    const connectionId = event.requestContext.connectionId

    if (!connectionId) {
        return {
            statusCode: 400,
            body: 'invalid connection id',
        }
    }

    const result = await store.queryItemsByConnectionId(connectionId)

    await commit(...result.data.map((i) => store.delete(i.pk, i.sk)))

    return { statusCode: 200, body: 'ok' }
}
