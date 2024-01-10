import { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Runtime, StartingPosition } from 'aws-cdk-lib/aws-lambda'
import { Duration } from 'aws-cdk-lib'
import { StateStore } from './state-store'
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { EventBus } from '../event'

type StateStorePublisherProps = {
    eventBus: EventBus
    stateStore: StateStore
} & Partial<NodejsFunction>

export class StateStorePublisher extends NodejsFunction {
    constructor(scope: Construct, id: string, props: StateStorePublisherProps) {
        super(scope, id, {
            functionName: `${id}-PublisherHandler`,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(10),
            memorySize: 512,
            entry: '../src/cdk/aggregate/state-store-publisher.handler.ts',
            handler: 'stateStorePublisherHandler',
            environment: {
                EVENT_BUS_NAME: props.eventBus.eventBusName,
            },
            ...props,
        })

        const { stateStore, eventBus } = props

        eventBus.grantPutEventsTo(this)

        this.addEventSource(new DynamoEventSource(stateStore, { batchSize: 10, startingPosition: StartingPosition.LATEST }))
    }
}
