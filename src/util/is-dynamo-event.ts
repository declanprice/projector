import { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda'

export const isDynamoStreamEvent = (event: any): event is DynamoDBStreamEvent => {
    return 'Records' in event
}

export const isDynamoEvent = (record: any): record is DynamoDBRecord => {
    return record?.eventSource && record.eventSource === 'aws:dynamodb'
}
