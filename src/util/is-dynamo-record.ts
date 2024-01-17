import { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda'

export const isDynamoStreamEvent = (event: any): event is DynamoDBStreamEvent => {
    return 'Records' in event
}

export const isDynamoRecord = (record: any): record is DynamoDBRecord => {
    return record?.eventSource && record.eventSource === 'aws:dynamodb'
}
