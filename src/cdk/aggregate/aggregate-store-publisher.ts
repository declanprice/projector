import { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Runtime, StartingPosition } from 'aws-cdk-lib/aws-lambda'
import { Duration } from 'aws-cdk-lib'
import { AggregateStore } from './aggregate-store'
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { ChangeBus } from '../change'
import * as path from 'path'
import * as fs from 'fs'

type AggregateStorePublisherProps = {
    changeBus: ChangeBus
    aggregateStore: AggregateStore
} & Partial<NodejsFunction>

export class AggregateStorePublisher extends NodejsFunction {
    constructor(scope: Construct, id: string, props: AggregateStorePublisherProps) {
        const isPackage = fs.existsSync(path.join(__dirname, './aggregate-store-publisher.handler.js'))

        super(scope, id, {
            functionName: `${id}`,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(10),
            memorySize: 512,
            entry: path.join(__dirname, `./aggregate-store-publisher.handler.${isPackage ? 'js' : 'ts'}`),
            handler: 'aggregateStorePublisherHandler',
            environment: {
                CHANGE_BUS_NAME: props.changeBus.eventBusName,
            },
            ...props,
        })

        const { aggregateStore, changeBus } = props

        changeBus.grantPutEventsTo(this)

        this.addEventSource(
            new DynamoEventSource(aggregateStore, { batchSize: 10, startingPosition: StartingPosition.LATEST })
        )
    }
}
