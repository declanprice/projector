import { APIGatewayProxyEventV2 } from 'aws-lambda'

export const subscriptionApiDisconnectHandler = async (event: APIGatewayProxyEventV2) => {
    console.log(`[ON DISCONNECT EVENT] - ${JSON.stringify(event, null, 2)})`)

    return { statusCode: 200, body: 'ok' }
}
