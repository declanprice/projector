import { APIGatewayProxyEventV2, SQSEvent } from 'aws-lambda'

export const isHttpEvent = (event: any): event is APIGatewayProxyEventV2 => {
    return 'routeKey' in event
}
