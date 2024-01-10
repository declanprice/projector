import { Duration } from 'aws-cdk-lib'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { HandleEvent } from '../../event'
import { Match, Rule } from 'aws-cdk-lib/aws-events'
import { LambdaFunction, SqsQueue } from 'aws-cdk-lib/aws-events-targets'
import { EventBus } from './event-bus'
import { getEventHandlerProps } from '../../event/event-handler.decorator'
import { SubscriptionUpdateBus } from '../subscription/subscription-update-bus'
import { EventStore, StateStore } from '../aggregate'
import { OutboxStore } from '../outbox'
import { ProjectionStore } from '../projection'
import { Queue } from 'aws-cdk-lib/aws-sqs'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'

type EventHandlerProps = {
    eventBus: EventBus
    stateStore?: StateStore
    eventStore?: EventStore
    outboxStore?: OutboxStore
    projectionStores?: ProjectionStore[]
    subscriptionUpdateBus?: SubscriptionUpdateBus
} & Partial<NodejsFunctionProps>

export class EventHandler extends NodejsFunction {
    constructor(scope: Construct, handler: { new (...props: any): HandleEvent }, props: EventHandlerProps) {
        super(scope, handler.name, {
            functionName: handler.name,
            runtime: Runtime.NODEJS_20_X,
            handler: `index.${handler.name}.prototype.eventHandler`,
            timeout: Duration.seconds(10),
            memorySize: 512,
            bundling: {
                keepNames: true,
            },
            ...props,
        })

        const { eventBus, stateStore, eventStore, outboxStore, projectionStores, subscriptionUpdateBus } = props

        const eventHandlerProps = getEventHandlerProps(handler)

        const handlerQueue = new Queue(this, `${handler.name}-Queue`, {
            queueName: `${handler.name}-Queue`,
        })

        this.addEventSource(new SqsEventSource(handlerQueue, { batchSize: 10 }))

        new Rule(this, `${handler.name}-Rule`, {
            ruleName: `${handler.name}-Rule`,
            eventBus,
            eventPattern: {
                detailType: Match.anyOf(eventHandlerProps.on.map((e) => e.name)),
            },
            targets: [new SqsQueue(handlerQueue)],
        })

        if (subscriptionUpdateBus) {
            subscriptionUpdateBus.grantPublish(this)
            this.addEnvironment('SUBSCRIPTION_BUS_ARN', subscriptionUpdateBus.topicArn)
        }

        if (stateStore) {
            stateStore.grantReadWriteData(this)
            this.addEnvironment('STATE_STORE_NAME', stateStore.tableName)
        }

        if (eventStore) {
            eventStore.grantReadWriteData(this)
            this.addEnvironment('EVENT_STORE_NAME', eventStore.tableName)
        }

        if (outboxStore) {
            outboxStore.grantWriteData(this)
            this.addEnvironment('OUTBOX_STORE_NAME', outboxStore.tableName)
        }

        if (projectionStores) {
            for (const projectionStore of projectionStores) {
                projectionStore.grantReadWriteData(this)
            }
        }
    }
}
