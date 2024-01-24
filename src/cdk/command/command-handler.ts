import { Duration, Stack } from 'aws-cdk-lib'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { AggregateStore } from '../aggregate'
import { OutboxStore } from '../outbox'
import { SubscriptionBus } from '../subscription/subscription-bus'
import { HandleCommand, getCommandHandlerProps } from '../../command'
import { HandlerApi } from '../handler-api'
import { ProjectionStore } from '../projection'
import { SchedulerStore } from '../scheduler'

type CommandHandlerProps = {
    handlerApi?: HandlerApi
    aggregateStore?: AggregateStore
    outboxStore?: OutboxStore
    schedulerStore?: SchedulerStore
    projectionStores?: ProjectionStore[]
    subscriptionBus?: SubscriptionBus
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

        this.addEnvironment('REGION', Stack.of(scope).region)
        this.addEnvironment('ACCOUNT', Stack.of(scope).account)

        const { handlerApi, subscriptionBus, aggregateStore, outboxStore, schedulerStore, projectionStores } = props

        const metadata = getCommandHandlerProps(handler)

        if (handlerApi) {
            if (metadata.path) {
                handlerApi.addRoutes({
                    path: metadata.path,
                    methods: [metadata?.method === 'PUT' ? HttpMethod.PUT : HttpMethod.POST],
                    integration: new HttpLambdaIntegration(`${handler.name}-HttpIntegration`, this),
                })
            }
        }

        if (subscriptionBus) {
            subscriptionBus.grantPublish(this)
            this.addEnvironment('SUBSCRIPTION_BUS_ARN', subscriptionBus.topicArn)
        }

        if (aggregateStore) {
            aggregateStore.grantReadWriteData(this)
            this.addEnvironment('AGGREGATE_STORE_NAME', aggregateStore.tableName)
        }

        if (schedulerStore) {
            schedulerStore.grantWriteData(this)
            this.addEnvironment('SCHEDULER_STORE_NAME', schedulerStore.tableName)
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
