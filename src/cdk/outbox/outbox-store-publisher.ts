import { Construct } from 'constructs'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { OutboxStore } from './outbox-store'
import { Duration } from 'aws-cdk-lib'
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { StartingPosition } from 'aws-cdk-lib/aws-lambda'
import { EventBus } from '../event'

type OutboxPublisherProps = {
    eventBus: EventBus
    outboxStore: OutboxStore
} & Partial<NodejsFunctionProps>

export class OutboxStorePublisher extends NodejsFunction {
    constructor(scope: Construct, id: string, props: OutboxPublisherProps) {
        super(scope, id, {
            functionName: id,
            timeout: Duration.seconds(10),
            memorySize: 512,
            entry: '../src/cdk/outbox/outbox-publisher.handler.ts',
            handler: 'outboxPublisherHandler',
            environment: {
                OUTBOX_STORE_NAME: props.outboxStore.tableName,
                EVENT_BUS_NAME: props.eventBus.eventBusName,
            },
            ...props,
        })

        const { outboxStore, eventBus } = props

        eventBus.grantPutEventsTo(this)

        outboxStore.grantReadWriteData(this)

        this.addEventSource(
            new DynamoEventSource(outboxStore, {
                batchSize: 10,
                startingPosition: StartingPosition.LATEST,
            })
        )
    }
}
