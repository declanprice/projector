import { Construct } from 'constructs'
import { EventStore } from './event-store'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Runtime, StartingPosition } from 'aws-cdk-lib/aws-lambda'
import { Duration } from 'aws-cdk-lib'
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { EventBus } from '../event'

type EventStorePublisherProps = {
    eventBus: EventBus
    eventStore: EventStore
} & Partial<NodejsFunction>

export class EventStorePublisher extends NodejsFunction {
    constructor(scope: Construct, id: string, props: EventStorePublisherProps) {
        super(scope, id, {
            functionName: `${id}-Publisher`,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(10),
            memorySize: 512,
            entry: '../src/cdk/aggregate/event-store-publisher.handler.ts',
            handler: 'eventStorePublisherHandler',
            environment: {
                EVENT_BUS_NAME: props.eventBus.eventBusName,
            },
            ...props,
        })

        const { eventStore, eventBus } = props

        eventBus.grantPutEventsTo(this)

        this.addEventSource(new DynamoEventSource(eventStore, { batchSize: 10, startingPosition: StartingPosition.LATEST }))
    }
}
