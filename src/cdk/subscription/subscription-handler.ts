import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { Duration } from 'aws-cdk-lib'
import { HandleCommand } from '../../command'
import { HandleSubscription } from '../../subscription'
import { SubscriptionApi } from './subscription-api'
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { getSubscriptionHandlerProps } from '../../subscription/subscription-handler.decorator'
import { SubscriptionStore } from './subscription-store'
import { Queue } from 'aws-cdk-lib/aws-sqs'
import { SnsEventSource, SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { SubscriptionUpdateBus } from './subscription-update-bus'

type SubscriptionHandlerProps = {
    subscriptionApi: SubscriptionApi
    subscriptionUpdateBus: SubscriptionUpdateBus
    subscriptionStore: SubscriptionStore
    entry: string
} & Partial<NodejsFunction>

export class SubscriptionHandler extends NodejsFunction {
    constructor(scope: Construct, handler: { new (...props: any): HandleSubscription }, props: SubscriptionHandlerProps) {
        super(scope, handler.name, {
            functionName: handler.name,
            handler: `index.${handler.name}.prototype.subscriptionHandler`,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(10),
            memorySize: 512,
            environment: {
                SUBSCRIPTION_STORE_NAME: props.subscriptionStore.tableName,
            },
            ...props,
        })

        const { subscriptionApi, subscriptionStore, subscriptionUpdateBus } = props

        subscriptionStore.grantReadWriteData(this)

        const subscriptionHandlerProps = getSubscriptionHandlerProps(handler)

        const integration = new WebSocketLambdaIntegration(`${handler.name}-WebSocketIntegration`, this)

        subscriptionApi.addRoute(`${subscriptionHandlerProps}.add`, {
            integration,
        })

        subscriptionApi.addRoute(`${subscriptionHandlerProps}.remove`, {
            integration,
        })

        this.addEventSource(new SnsEventSource(subscriptionUpdateBus))
    }
}
