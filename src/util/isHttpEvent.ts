import { APIGatewayProxyEventV2, SQSEvent } from 'aws-lambda'

export const isHttpEvent = (event: APIGatewayProxyEventV2 | SQSEvent): event is APIGatewayProxyEventV2 => {
    return 'routeKey' in event
}
