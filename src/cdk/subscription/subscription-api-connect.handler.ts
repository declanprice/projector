import { APIGatewayProxyEvent } from 'aws-lambda'

import { SubscriptionStore } from '../../store/subscription/subscription.store'

const store = new SubscriptionStore()

export const subscriptionApiConnectHandler = async (event: APIGatewayProxyEvent) => {
    console.log(`[ON CONNECT EVENT] - ${JSON.stringify(event, null, 2)})`)

    const connectionId = event.requestContext.connectionId

    if (!connectionId) {
        return {
            statusCode: 400,
            body: 'invalid connection id',
        }
    }

    await store.connect(connectionId).exec()

    return { statusCode: 200, body: 'ok' }
}
