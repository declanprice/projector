import { Duration } from 'aws-cdk-lib'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { Match, Rule } from 'aws-cdk-lib/aws-events'
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets'
import { EventBus } from './event-bus'
import { SubscriptionBus } from '../subscription'
import { AggregateStore } from '../aggregate'
import { ProjectionStore } from '../projection'
import { Queue } from 'aws-cdk-lib/aws-sqs'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { getChangeGroupTypes } from '../../event/change-group.decorator'

type ChangeHandlerProps = {
    eventBus: EventBus
    aggregateStore?: AggregateStore
    projectionStores?: ProjectionStore[]
    subscriptionBus?: SubscriptionBus
} & Partial<NodejsFunctionProps>

export class ChangeGroup extends NodejsFunction {
    constructor(scope: Construct, handler: { new (...props: any): any }, props: ChangeHandlerProps) {
        super(scope, handler.name, {
            functionName: handler.name,
            runtime: Runtime.NODEJS_20_X,
            handler: `index.${handler.name}.prototype.changeGroupHandler`,
            timeout: Duration.seconds(10),
            memorySize: 512,
            bundling: {
                keepNames: true,
            },
            ...props,
        })

        const { eventBus, aggregateStore, projectionStores, subscriptionBus } = props

        const handlerQueue = new Queue(this, `${handler.name}-Queue`, {
            queueName: `${handler.name}-Queue`,
        })

        this.addEventSource(new SqsEventSource(handlerQueue, { batchSize: 10 }))

        const changeTypes = getChangeGroupTypes(handler)

        if (!changeTypes.length) throw new Error('@ChangeGroup must have at least one valid @ChangeHandler')

        new Rule(this, `${handler.name}-Rule`, {
            ruleName: `${handler.name}-Rule`,
            eventBus: eventBus,
            eventPattern: {
                detailType: Match.exactString('CHANGE_EVENT'),
                detail:
                    changeTypes.length > 1
                        ? {
                              $or: Match.anyOf(
                                  changeTypes.map((type) => ({
                                      type: Match.exactString(type.type),
                                      change: Match.exactString(type.change),
                                  }))
                              ),
                          }
                        : {
                              type: Match.exactString(changeTypes[0].type),
                              change: Match.exactString(changeTypes[0].change),
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
