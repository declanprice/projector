import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { Duration, Stack } from 'aws-cdk-lib'
import { HandleSubscription } from '../../subscription'
import { SubscriptionApi } from './subscription-api'
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { getSubscriptionHandlerProps } from '../../subscription/subscription-handler.decorator'
import { SubscriptionStore } from './subscription-store'
import { SnsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { SubscriptionBus } from './subscription-bus'
import { Type } from '../../util/type'
import { SubscriptionFilter } from 'aws-cdk-lib/aws-sns'
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'

type SubscriptionHandlerProps = {
    subscriptionApi: SubscriptionApi
    subscriptionStore: SubscriptionStore
    subscriptionBus: SubscriptionBus
    entry: string
} & Partial<NodejsFunction>

export class SubscriptionHandler extends NodejsFunction {
    constructor(scope: Construct, handler: Type<HandleSubscription<any, any>>, props: SubscriptionHandlerProps) {
        super(scope, handler.name, {
            functionName: handler.name,
            handler: `index.${handler.name}.prototype.subscriptionHandler`,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(10),
            memorySize: 512,
            ...props,
        })

        this.addEnvironment('SUBSCRIPTION_API_ENDPOINT', props.subscriptionApi.apiEndpoint)
        this.addEnvironment('SUBSCRIPTION_STORE_NAME', props.subscriptionStore.tableName)

        const { subscriptionApi, subscriptionStore, subscriptionBus } = props

        const handlerProps = getSubscriptionHandlerProps(handler)

        subscriptionApi.grantManageConnections(this)

        subscriptionStore.grantReadWriteData(this)

        const subscriptionHandlerProps = getSubscriptionHandlerProps(handler)

        const integration = new WebSocketLambdaIntegration(`${handler.name}-WebSocketIntegration`, this)

        subscriptionApi.addRoute(`${subscriptionHandlerProps.route}.add`, {
            integration,
            returnResponse: true,
        })

        subscriptionApi.addRoute(`${subscriptionHandlerProps.route}.remove`, {
            integration,
            returnResponse: true,
        })

        this.addEventSource(
            new SnsEventSource(subscriptionBus, {
                filterPolicy: {
                    type: SubscriptionFilter.stringFilter({
                        allowlist: [handlerProps.on.name],
                    }),
                },
            })
        )
    }
}
