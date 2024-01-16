import { APIGatewayProxyEventV2 } from 'aws-lambda'

export const isHttpEvent = (event: any): event is APIGatewayProxyEventV2 => {
    return 'routeKey' in event && 'requestContext' in event
}
