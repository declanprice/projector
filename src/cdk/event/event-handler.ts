import { Duration } from 'aws-cdk-lib'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { Match, Rule } from 'aws-cdk-lib/aws-events'
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets'
import { Queue } from 'aws-cdk-lib/aws-sqs'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { EventBus } from './event-bus'
import { getEventGroupTypes } from '../../event/event-handler.decorator'
import { SubscriptionUpdateBus } from '../subscription/subscription-update-bus'
import { AggregateStore } from '../aggregate'
import { OutboxStore } from '../outbox'
import { ProjectionStore } from '../projection'

type EventHandlerProps = {
    eventBus: EventBus
    aggregateStore?: AggregateStore
    outboxStore?: OutboxStore
    projectionStores?: ProjectionStore[]
    subscriptionUpdateBus?: SubscriptionUpdateBus
} & Partial<NodejsFunctionProps>

export class EventHandler extends NodejsFunction {
    constructor(scope: Construct, handler: { new (...props: any): any }, props: EventHandlerProps) {
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

        const { eventBus, aggregateStore, outboxStore, projectionStores, subscriptionUpdateBus } = props

        const handlerQueue = new Queue(this, `${handler.name}-Queue`, {
            queueName: `${handler.name}-Queue`,
        })

        this.addEventSource(new SqsEventSource(handlerQueue, { batchSize: 10 }))

        const eventGroupTypes = getEventGroupTypes(handler)

        if (!eventGroupTypes.length) throw new Error('@EventHandlerGroup must have at least one valid @EventHandler')

        new Rule(this, `${handler.name}-Rule`, {
            ruleName: `${handler.name}-Rule`,
            eventBus,
            eventPattern: {
                detailType: Match.exactString('EVENT'),
                detail:
                    eventGroupTypes.length > 1
                        ? {
                              $or: Match.anyOf(
                                  getEventGroupTypes(handler).map((type) => ({
                                      type: Match.exactString(type),
                                  }))
                              ),
                          }
                        : {
                              type: Match.exactString(eventGroupTypes[0]),
                          },
            },
            targets: [new SqsQueue(handlerQueue)],
        })

        if (subscriptionUpdateBus) {
            subscriptionUpdateBus.grantPublish(this)
            this.addEnvironment('SUBSCRIPTION_BUS_ARN', subscriptionUpdateBus.topicArn)
        }

        if (aggregateStore) {
            aggregateStore.grantReadWriteData(this)
            this.addEnvironment('AGGREGATE_STORE_NAME', aggregateStore.tableName)
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
