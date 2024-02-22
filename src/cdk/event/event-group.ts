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
import { getEventGroupTypes } from '../../event/event-group.decorator'
import { OutboxStore } from '../outbox'

type EventHandlerProps = {
    eventBus: EventBus
    aggregateStore?: AggregateStore
    outboxStore?: OutboxStore
    projectionStores?: ProjectionStore[]
    subscriptionBus?: SubscriptionBus
} & Partial<NodejsFunctionProps>

export class EventGroup extends NodejsFunction {
    constructor(scope: Construct, handler: { new (...props: any): any }, props: EventHandlerProps) {
        super(scope, handler.name, {
            functionName: handler.name,
            runtime: Runtime.NODEJS_20_X,
            handler: `index.${handler.name}.prototype.eventGroupHandler`,
            timeout: Duration.seconds(10),
            memorySize: 512,
            bundling: {
                keepNames: true,
            },
            ...props,
        })

        const { eventBus, aggregateStore, outboxStore, projectionStores, subscriptionBus } = props

        const handlerQueue = new Queue(this, `${handler.name}-Queue`, {
            queueName: `${handler.name}-Queue`,
        })

        this.addEventSource(new SqsEventSource(handlerQueue, { batchSize: 10 }))

        const eventTypes = getEventGroupTypes(handler)

        if (!eventTypes.length) throw new Error('@EventGroup must have at least one valid @EventGroup')

        new Rule(this, `${handler.name}-Rule`, {
            ruleName: `${handler.name}-Rule`,
            eventBus: eventBus,
            eventPattern: {
                detailType: Match.exactString('EVENT'),
                detail:
                    eventTypes.length > 1
                        ? {
                              type: Match.anyOf(eventTypes.map((type) => Match.exactString(type))),
                          }
                        : {
                              type: Match.exactString(eventTypes[0]),
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

        if (outboxStore) {
            outboxStore.grantReadWriteData(this)
        }

        if (projectionStores) {
            for (const projectionStore of projectionStores) {
                projectionStore.grantReadWriteData(this)
            }
        }
    }
}
