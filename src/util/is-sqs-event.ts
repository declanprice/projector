import { APIGatewayProxyEventV2, SQSEvent, SQSRecord } from 'aws-lambda'

export const isSqsEvent = (event: APIGatewayProxyEventV2 | SQSEvent): event is SQSEvent => {
    return 'Records' in event
}

export const isSqsRecord = (record: any): record is SQSRecord => {
    return record?.eventSource && record.eventSource === 'aws:sqs'
}
