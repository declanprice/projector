import { APIGatewayProxyEvent } from 'aws-lambda'
import { SubscriptionStore } from '../../store/subscription/subscription.store'
import { StoreItem } from '../../store/store.item'
import { transactWriteItems } from '@declanprice/dynostore'

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

    const result = await store.queryItemsByConnectionId<StoreItem>(connectionId).exec()

    await transactWriteItems(...result.items.map((i) => store.delete().key({ pk: i.pk, sk: i.sk! }).tx()))

    return { statusCode: 200, body: 'ok' }
}
