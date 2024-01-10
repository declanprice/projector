import { Construct } from 'constructs'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Duration } from 'aws-cdk-lib'
import { OutboxStore } from './outbox-store'
import { OutboxPublisherQueue } from './outbox-publisher-queue'

type OutboxStorePollerProps = {
    outboxStore: OutboxStore
    outboxPublisherQueue: OutboxPublisherQueue
} & Partial<NodejsFunctionProps>

export class OutboxStorePoller extends NodejsFunction {
    constructor(scope: Construct, id: string, props: OutboxStorePollerProps) {
        super(scope, id, {
            functionName: id,
            timeout: Duration.seconds(10),
            memorySize: 512,
            entry: '../src/outbox/outbox-poller.handler.ts',
            handler: 'outboxPollerHandler',
            environment: {
                OUTBOX_PUBLISHER_QUEUE_URL: props.outboxPublisherQueue.queueUrl,
            },
            ...props,
        })

        const { outboxPublisherQueue } = props

        outboxPublisherQueue.grantSendMessages(this)
    }
}
