import { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Runtime, StartingPosition } from 'aws-cdk-lib/aws-lambda'
import { Duration } from 'aws-cdk-lib'
import { AggregateStore } from './aggregate-store'
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { EventBus } from '../event'

type StateStorePublisherProps = {
    eventBus: EventBus
    aggregateStore: AggregateStore
} & Partial<NodejsFunction>

export class AggregateStorePublisher extends NodejsFunction {
    constructor(scope: Construct, id: string, props: StateStorePublisherProps) {
        super(scope, id, {
            functionName: `${id}`,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(10),
            memorySize: 512,
            entry: '../src/cdk/aggregate/aggregate-store-publisher.handler.ts',
            handler: 'aggregateStorePublisherHandler',
            environment: {
                EVENT_BUS_NAME: props.eventBus.eventBusName,
            },
            ...props,
        })

        const { aggregateStore, eventBus } = props

        eventBus.grantPutEventsTo(this)

        this.addEventSource(
            new DynamoEventSource(aggregateStore, { batchSize: 10, startingPosition: StartingPosition.LATEST })
        )
    }
}
