import { APIGatewayProxyEvent } from 'aws-lambda'

export const subscriptionApiDefaultHandler = async (event: APIGatewayProxyEvent) => {
    console.log(`[ON DEFAULT EVENT] - ${JSON.stringify(event, null, 2)})`)

    return {
        statusCode: 200,
        body: 'pong',
    }
}
