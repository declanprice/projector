import { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from 'aws-lambda'

export const isHttpEvent = (event: any): event is APIGatewayProxyEventV2 => {
    return 'requestContext' in event
}
