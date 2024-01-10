import { FifoThroughputLimit, Queue, QueueProps } from 'aws-cdk-lib/aws-sqs'
import { Construct } from 'constructs'

type ProcessQueueProps = {} & QueueProps

export class ProcessQueue extends Queue {
    constructor(scope: Construct, id: string, props?: ProcessQueueProps) {
        super(scope, id, {
            queueName: id,
            fifo: true,
            fifoThroughputLimit: FifoThroughputLimit.PER_MESSAGE_GROUP_ID,
            contentBasedDeduplication: true,
            ...props,
        })
    }
}
