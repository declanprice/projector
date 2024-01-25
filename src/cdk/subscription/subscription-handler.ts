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
    constructor(scope: Construct, handler: Type<HandleSubscription>, props: SubscriptionHandlerProps) {
        super(scope, handler.name, {
            functionName: handler.name,
            handler: `index.${handler.name}.prototype.subscriptionHandler`,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(10),
            memorySize: 512,
            ...props,
        })

        this.addEnvironment('SUBSCRIPTION_API_ENDPOINT', this.apiEndpoint(props.subscriptionApi.apiId))
        this.addEnvironment('SUBSCRIPTION_STORE_NAME', props.subscriptionStore.tableName)

        const { subscriptionApi, subscriptionStore, subscriptionBus } = props

        const handlerProps = getSubscriptionHandlerProps(handler)

        subscriptionApi.grantManageConnections(this)

        subscriptionStore.grantReadWriteData(this)

        const subscriptionHandlerProps = getSubscriptionHandlerProps(handler)

        subscriptionApi.addRoute(`${subscriptionHandlerProps.route}.sub`, {
            integration: new WebSocketLambdaIntegration(`${handler.name}-SubIntegration`, this),
            returnResponse: true,
        })

        subscriptionApi.addRoute(`${subscriptionHandlerProps.route}.unsub`, {
            integration: new WebSocketLambdaIntegration(`${handler.name}-UnsubIntegration`, this),
            returnResponse: true,
        })

        this.addEventSource(
            new SnsEventSource(subscriptionBus, {
                filterPolicy: {
                    route: SubscriptionFilter.stringFilter({
                        allowlist: [handlerProps.route],
                    }),
                },
            })
        )
    }

    private apiEndpoint(apiId: string): string {
        return `${apiId}.execute-api.${Stack.of(this).region}.amazonaws.com/prod`
    }
}
