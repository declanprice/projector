import { SNSEvent, SNSMessage } from 'aws-lambda/trigger/sns'

export const isSnsEvent = (event: any): event is SNSEvent => {
    return 'Records' in event
}

export const isSnsMessage = (event: any): event is SNSMessage => {
    return 'TopicArn' in event && 'Message' in event
}

export const createTopicArn = (topicName: string) => {
    const REGION = process.env.REGION as string
    const ACCOUNT = process.env.ACCOUNT as string
    return `arn:aws:sns:${REGION}:${ACCOUNT}:${topicName}`
}
