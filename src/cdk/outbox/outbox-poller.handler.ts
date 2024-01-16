import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { SQSClient } from '@aws-sdk/client-sqs'

const dynamoClient = new DynamoDBClient()
const sqsClient = new SQSClient()

export const outboxPollerHandler = () => {
    console.log('outbox poller handler')
}
