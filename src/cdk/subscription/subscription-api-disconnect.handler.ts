import { APIGatewayProxyEvent } from 'aws-lambda'
import { SubscriptionStore } from '../../store/subscription/subscription.store'
import { transactWriteItems } from '@declanprice/dynostore'
import { SubscriptionItem } from '../../store/subscription/subscription.item'
import { SubscriptionConnectionItem } from '../../store/subscription/subscription-connection.item'

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

    const result = await store
        .queryItemsByConnectionId<SubscriptionItem | SubscriptionConnectionItem>(connectionId)
        .exec()

    await transactWriteItems(...result.items.map((i) => store.delete().key({ pk: i.sk, sk: i.sk }).tx()))

    return { statusCode: 200, body: 'ok' }
}
