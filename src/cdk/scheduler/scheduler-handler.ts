import { Duration } from 'aws-cdk-lib'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { Match, Rule } from 'aws-cdk-lib/aws-events'
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets'
import { SubscriptionBus } from '../subscription'
import { AggregateStore } from '../aggregate'
import { ProjectionStore } from '../projection'
import { Queue } from 'aws-cdk-lib/aws-sqs'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { ChangeBus } from '../change'
import { HandleSchedule } from '../../scheduler/scheduler.handler'
import { getSchedulerHandlerProps, getSchedulerHandlerType } from '../../scheduler/scheduler-handler.decorator'

type SchedulerHandlerProps = {
    changeBus: ChangeBus
    aggregateStore?: AggregateStore
    projectionStores?: ProjectionStore[]
    subscriptionBus?: SubscriptionBus
} & Partial<NodejsFunctionProps>

export class SchedulerHandler extends NodejsFunction {
    constructor(scope: Construct, handler: { new (...props: any): HandleSchedule }, props: SchedulerHandlerProps) {
        super(scope, handler.name, {
            functionName: handler.name,
            runtime: Runtime.NODEJS_20_X,
            handler: `index.${handler.name}.prototype.schedulerHandler`,
            timeout: Duration.seconds(10),
            memorySize: 512,
            bundling: {
                keepNames: true,
            },
            ...props,
        })

        const { changeBus, aggregateStore, projectionStores, subscriptionBus } = props

        const handlerQueue = new Queue(this, `${handler.name}-Queue`, {
            queueName: `${handler.name}-Queue`,
        })

        const handlerType = getSchedulerHandlerType(handler)

        const handlerProps = getSchedulerHandlerProps(handler)

        this.addEventSource(new SqsEventSource(handlerQueue, { batchSize: handlerProps?.batchSize ?? 10 }))

        new Rule(this, `${handler.name}-Rule`, {
            ruleName: `${handler.name}-Rule`,
            eventBus: changeBus,
            eventPattern: {
                detailType: Match.exactString('SCHEDULER_EVENT'),
                detail: {
                    type: Match.exactString(handlerType),
                },
            },
            targets: [new SqsQueue(handlerQueue)],
        })

        if (subscriptionBus) {
            subscriptionBus.grantPublish(this)
        }

        if (aggregateStore) {
            aggregateStore.grantReadWriteData(this)
        }

        if (projectionStores) {
            for (const projectionStore of projectionStores) {
                projectionStore.grantReadWriteData(this)
            }
        }
    }
}
