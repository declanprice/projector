import { Queue, QueueProps } from 'aws-cdk-lib/aws-sqs'
import { Construct } from 'constructs'

type ProcessQueueProps = {} & QueueProps

export class ProcessQueue extends Queue {
    constructor(scope: Construct, id: string, props?: ProcessQueueProps) {
        super(scope, id, {
            queueName: id,
            ...props,
        })
    }
}
