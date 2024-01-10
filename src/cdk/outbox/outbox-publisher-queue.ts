import { Construct } from 'constructs'
import { Queue, QueueProps } from 'aws-cdk-lib/aws-sqs'

type OutboxPublisherProps = {} & Partial<QueueProps>

export class OutboxPublisherQueue extends Queue {
    constructor(scope: Construct, id: string, props?: OutboxPublisherProps) {
        super(scope, id, {
            queueName: id,
            ...props,
        })
    }
}
