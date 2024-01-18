import { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { Duration } from 'aws-cdk-lib'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets'
import { Match, Rule } from 'aws-cdk-lib/aws-events'
import { ProcessQueue } from './process-queue'
import { EventBus } from '../event'
import { getProcessEventTypes } from '../../process/process.decorator'
import { getEventHandlerGroupTypes } from '../../event/event-handler.decorator'
import { ProcessStore } from './process-store'
import { OutboxStore } from '../outbox'
import { AggregateStore } from '../aggregate'
import { ProjectionStore } from '../projection'

type ProcessHandlerProps = {
    eventBus: EventBus
    processStore: ProcessStore
    outboxStore?: OutboxStore
    aggregateStore?: AggregateStore
    projectionStores?: ProjectionStore[]
    entry: string
} & Partial<NodejsFunction>

export class ProcessHandler extends NodejsFunction {
    constructor(scope: Construct, handler: { new (...props: any): any }, props: ProcessHandlerProps) {
        super(scope, handler.name, {
            functionName: handler.name,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(10),
            memorySize: 512,
            handler: `index.${handler.name}.prototype.processHandler`,
            ...props,
        })

        const { eventBus, processStore, outboxStore, aggregateStore, projectionStores } = props

        processStore.grantReadWriteData(this)
        this.addEnvironment('PROCESS_STORE_NAME', processStore.tableName)

        if (outboxStore) {
            outboxStore.grantReadWriteData(this)
            this.addEnvironment('OUTBOX_STORE_NAME', outboxStore.tableName)
        }

        if (aggregateStore) {
            aggregateStore.grantReadWriteData(this)
            this.addEnvironment('AGGREGATE_STORE_NAME', aggregateStore.tableName)
        }

        if (projectionStores) {
            for (const store of projectionStores) {
                store.grantReadWriteData(this)
            }
        }

        const processQueue = new ProcessQueue(this, `${handler.name}-Queue`)
        this.addEventSource(new SqsEventSource(processQueue, { batchSize: 10 }))

        const eventTypes = getProcessEventTypes(handler)
        if (!eventTypes.length) throw new Error('@Process must have at least one valid @ProcessHandler')
        new Rule(this, `${handler.name}-Rule`, {
            eventBus,
            eventPattern: {
                detailType: Match.exactString('EVENT'),
                detail:
                    eventTypes.length > 1
                        ? {
                              $or: Match.anyOf(
                                  getEventHandlerGroupTypes(handler).map((type) => ({
                                      type: Match.exactString(type),
                                  }))
                              ),
                          }
                        : {
                              type: Match.exactString(eventTypes[0]),
                          },
            },
            targets: [new SqsQueue(processQueue)],
        })
    }
}
