import { DynamoDBRecord } from 'aws-lambda'

export const isDynamoRecord = (record: any): record is DynamoDBRecord => {
    return record?.eventSource && record.eventSource === 'aws:dynamodb'
}
