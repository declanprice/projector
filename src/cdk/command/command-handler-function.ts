import { Duration } from 'aws-cdk-lib'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { CommandBus } from './command-bus'
import { HandleCommand } from '../../command/command.handler'
import { RestApi } from '../rest-api'
import { SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions'
import { SubscriptionFilter } from 'aws-cdk-lib/aws-sns'
import { Queue } from 'aws-cdk-lib/aws-sqs'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { getCommandHandlerProps } from '../../command'
import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { StateStore } from '../stores/state-store'
import { EventStore } from '../stores/event-store'
import { OutboxStore } from '../outbox'

type CommandHandlerProps = {
    restApi?: RestApi
    commandBus?: CommandBus
    stateStore?: StateStore
    eventStore?: EventStore
    outboxStore?: OutboxStore
} & Partial<NodejsFunctionProps>

export class CommandHandlerFunction extends NodejsFunction {
    constructor(scope: Construct, handler: { new (): HandleCommand }, props: CommandHandlerProps) {
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

        const { restApi, commandBus, stateStore, eventStore, outboxStore } = props

        if (restApi) {
            const metadata = getCommandHandlerProps(handler)

            restApi.addRoutes({
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
    }
}
