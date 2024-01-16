import { aws_timestream, Duration } from 'aws-cdk-lib'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { Match, Rule } from 'aws-cdk-lib/aws-events'
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets'
import { EventBus } from './event-bus'
import { getEventGroupTypes } from '../../event/event-handler.decorator'
import { SubscriptionUpdateBus } from '../subscription/subscription-update-bus'
import { AggregateStore } from '../aggregate'
import { OutboxStore } from '../outbox'
import { ProjectionStore } from '../projection'
import { Queue } from 'aws-cdk-lib/aws-sqs'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { getChangeGroupTypes } from '../../event/change-handler.decorator'

type ChangeHandlerProps = {
    eventBus: EventBus
    aggregateStore?: AggregateStore
    outboxStore?: OutboxStore
    projectionStores?: ProjectionStore[]
    subscriptionUpdateBus?: SubscriptionUpdateBus
} & Partial<NodejsFunctionProps>

export class ChangeHandler extends NodejsFunction {
    constructor(scope: Construct, handler: { new (...props: any): any }, props: ChangeHandlerProps) {
        super(scope, handler.name, {
            functionName: handler.name,
            runtime: Runtime.NODEJS_20_X,
            handler: `index.${handler.name}.prototype.changeHandler`,
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

        const changeGroupTypes = getChangeGroupTypes(handler)

        if (!changeGroupTypes.length) throw new Error('@ChangeHandlerGroup must have at least one valid @ChangeHandler')

        new Rule(this, `${handler.name}-Rule`, {
            ruleName: `${handler.name}-Rule`,
            eventBus,
            eventPattern: {
                detailType: Match.exactString('CHANGE_EVENT'),
                detail:
                    changeGroupTypes.length > 1
                        ? {
                              $or: Match.anyOf(
                                  getChangeGroupTypes(handler).map((type) => ({
                                      type: Match.exactString(type.type),
                                      change: Match.exactString(type.change),
                                  }))
                              ),
                          }
                        : {
                              type: Match.exactString(changeGroupTypes[0].type),
                              change: Match.exactString(changeGroupTypes[0].change),
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
