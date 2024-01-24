import { APIGatewayProxyEventV2 } from 'aws-lambda'

export const subscriptionApiConnectHandler = async (event: APIGatewayProxyEventV2) => {
    console.log(`[ON CONNECT EVENT] - ${JSON.stringify(event, null, 2)})`)
    return { statusCode: 200 }
}
