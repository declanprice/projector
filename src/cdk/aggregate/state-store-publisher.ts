import { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Runtime, StartingPosition } from 'aws-cdk-lib/aws-lambda'
import { Duration } from 'aws-cdk-lib'
import { StateStore } from './state-store'
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'

type StateStorePublisherProps = {
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
            ...props,
        })

        const { stateStore } = props

        this.addEventSource(new DynamoEventSource(stateStore, { batchSize: 10, startingPosition: StartingPosition.LATEST }))
    }
}
