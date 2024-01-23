import { Construct } from 'constructs'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { SchedulerStore } from './scheduler-store'
import { Duration } from 'aws-cdk-lib'
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { StartingPosition } from 'aws-cdk-lib/aws-lambda'
import { EventBus } from '../event'
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'

type OutboxPublisherProps = {
    eventBus: EventBus
    schedulerStore: SchedulerStore
} & Partial<NodejsFunctionProps>

export class SchedulerStorePublisher extends NodejsFunction {
    constructor(scope: Construct, id: string, props: OutboxPublisherProps) {
        super(scope, id, {
            functionName: id,
            timeout: Duration.seconds(10),
            memorySize: 512,
            entry: '../src/cdk/scheduler/scheduler-publisher.handler.ts',
            handler: 'schedulerPublisherHandler',
            environment: {
                EVENT_BUS_ARN: props.eventBus.eventBusArn,
            },
            ...props,
        })

        const { schedulerStore, eventBus } = props

        const schedulerRole = new Role(this, 'SchedulerRole', {
            assumedBy: new ServicePrincipal('scheduler.amazonaws.com'),
            roleName: 'SchedulerRole',
            inlinePolicies: {
                publish: new PolicyDocument({
                    statements: [
                        new PolicyStatement({
                            effect: Effect.ALLOW,
                            resources: [eventBus.eventBusArn],
                            actions: ['events:PutEvents'],
                        }),
                    ],
                }),
            },
        })

        this.addEnvironment('SCHEDULER_ROLE_ARN', schedulerRole.roleArn)

        eventBus.grantPutEventsTo(this)

        schedulerStore.grantReadWriteData(this)

        this.addEventSource(
            new DynamoEventSource(schedulerStore, {
                batchSize: 10,
                startingPosition: StartingPosition.LATEST,
            })
        )
    }
}
