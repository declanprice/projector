import { Construct } from 'constructs'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { OutboxStore } from './outbox-store'
import { Duration } from 'aws-cdk-lib'
import { OutboxPublisherQueue } from './outbox-publisher-queue'
import { DynamoEventSource, SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { StartingPosition } from 'aws-cdk-lib/aws-lambda'
import { CommandBus } from '../command/command-bus'
import { EventBus } from '../event-bus'

type OutboxPublisherProps = {
    commandBus: CommandBus
    eventBus: EventBus
    outboxStore: OutboxStore
    outboxPublisherQueue?: OutboxPublisherQueue
} & Partial<NodejsFunctionProps>

export class OutboxStorePublisher extends NodejsFunction {
    constructor(scope: Construct, id: string, props: OutboxPublisherProps) {
        super(scope, id, {
            functionName: id,
            timeout: Duration.seconds(10),
            memorySize: 512,
            entry: '../src/outbox/outbox-publisher.handler.ts',
            handler: 'outboxPublisherHandler',
            environment: {
                COMMAND_BUS_ARN: props.commandBus.topicArn,
                EVENT_BUS_ARN: props.eventBus.eventBusArn,
                EVENT_BUS_NAME: props.eventBus.eventBusName,
            },
            ...props,
        })

        const { outboxPublisherQueue, outboxStore, commandBus, eventBus } = props

        commandBus.grantPublish(this)

        eventBus.grantPutEventsTo(this)

        if (outboxPublisherQueue) {
            this.addEventSource(new SqsEventSource(outboxPublisherQueue, { batchSize: 10 }))
        }

        this.addEventSource(
            new DynamoEventSource(outboxStore, {
                batchSize: 10,
                startingPosition: StartingPosition.LATEST,
            })
        )
    }
}
