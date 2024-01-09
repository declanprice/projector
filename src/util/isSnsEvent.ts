import { SNSEvent, SNSMessage } from 'aws-lambda/trigger/sns'

export const isSnsEvent = (event: any): event is SNSEvent => {
    return 'Records' in event
}

export const isSnsMessage = (event: any): event is SNSMessage => {
    return 'TopicArn' in event
}
