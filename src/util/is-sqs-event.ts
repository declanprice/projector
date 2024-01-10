import { APIGatewayProxyEventV2, SQSEvent } from 'aws-lambda'

export const isSqsEvent = (event: APIGatewayProxyEventV2 | SQSEvent): event is SQSEvent => {
    return 'Records' in event
}
