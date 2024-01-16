import { Construct } from 'constructs'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Duration } from 'aws-cdk-lib'
import { OutboxStore } from './outbox-store'
import { OutboxPublisherQueue } from './outbox-publisher-queue'
import { Rule, Schedule } from 'aws-cdk-lib/aws-events'
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets'

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
            entry: '../src/cdk/outbox/outbox-poller.handler.ts',
            handler: 'outboxPollerHandler',
            environment: {
                OUTBOX_STORE_NAME: props.outboxStore.tableName,
                OUTBOX_PUBLISHER_QUEUE_URL: props.outboxPublisherQueue.queueUrl,
            },
            ...props,
        })

        const { outboxStore, outboxPublisherQueue } = props

        outboxStore.grantReadData(this)

        outboxPublisherQueue.grantSendMessages(this)

        new Rule(this, `${id}-MinuteCron`, {
            ruleName: `${id}-MinuteCron`,
            schedule: Schedule.rate(Duration.minutes(1)),
            targets: [new LambdaFunction(this)],
        })
    }
}
