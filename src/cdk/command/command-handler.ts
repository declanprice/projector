import { Duration } from 'aws-cdk-lib'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions'
import { SubscriptionFilter } from 'aws-cdk-lib/aws-sns'
import { Queue } from 'aws-cdk-lib/aws-sqs'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { AggregateStore } from '../aggregate'
import { OutboxStore } from '../outbox'
import { SubscriptionUpdateBus } from '../subscription/subscription-update-bus'
import { HandleCommand, getCommandHandlerProps } from '../../command'
import { HandlerApi } from '../handler-api'
import { CommandBus } from './command-bus'
import { ProjectionStore } from '../projection'

type CommandHandlerProps = {
    handlerApi?: HandlerApi
    commandBus?: CommandBus
    subscriptionUpdateBus?: SubscriptionUpdateBus
    aggregateStore?: AggregateStore
    outboxStore?: OutboxStore
    projectionStores?: ProjectionStore[]
    entry: string
} & Partial<NodejsFunctionProps>

export class CommandHandler extends NodejsFunction {
    constructor(scope: Construct, handler: { new (...props: any): HandleCommand }, props: CommandHandlerProps) {
        super(scope, handler.name, {
            functionName: handler.name,
            runtime: Runtime.NODEJS_20_X,
            handler: `index.${handler.name}.prototype.commandHandler`,
            timeout: Duration.seconds(10),
            memorySize: 512,
            bundling: {
                keepNames: true,
            },
            ...props,
        })

        const { handlerApi, commandBus, subscriptionUpdateBus, aggregateStore, outboxStore, projectionStores } = props

        if (handlerApi) {
            const metadata = getCommandHandlerProps(handler)

            handlerApi.addRoutes({
                path: metadata.path,
                methods: [metadata?.method === 'PUT' ? HttpMethod.PUT : HttpMethod.POST],
                integration: new HttpLambdaIntegration(`${handler.name}-HttpIntegration`, this),
            })
        }

        if (commandBus) {
            const handlerQueue = new Queue(this, `${handler.name}-Queue`, {
                queueName: `${handler.name}-Queue`,
            })

            this.addEventSource(new SqsEventSource(handlerQueue, { batchSize: 10 }))

            commandBus.addSubscription(
                new SqsSubscription(handlerQueue, {
                    filterPolicy: {
                        type: SubscriptionFilter.stringFilter({ allowlist: [handler.name] }),
                    },
                })
            )
        }

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
