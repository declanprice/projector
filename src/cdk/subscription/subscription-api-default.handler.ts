import { APIGatewayProxyEventV2 } from 'aws-lambda'

export const subscriptionApiDefaultHandler = async (event: APIGatewayProxyEventV2) => {
    console.log(`[ON DEFAULT EVENT] - ${JSON.stringify(event, null, 2)})`)

    return {
        statusCode: 200,
        body: 'pong',
    }
}
