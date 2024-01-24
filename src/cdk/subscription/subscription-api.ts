import { HttpApiProps, WebSocketApi, WebSocketStage } from 'aws-cdk-lib/aws-apigatewayv2'
import { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { SubscriptionStore } from './subscription-store'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { Duration } from 'aws-cdk-lib'
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'

type SubscriptionApiProps = {
    subscriptionStore: SubscriptionStore
} & Partial<HttpApiProps>

export class SubscriptionApi extends WebSocketApi {
    constructor(scope: Construct, id: string, props: SubscriptionApiProps) {
        super(scope, id, {
            apiName: id,
            routeSelectionExpression: '$request.body.action',
            defaultRouteOptions: {
                integration: new WebSocketLambdaIntegration(
                    `${id}-DefaultWebsocketIntegration`,
                    new NodejsFunction(scope, `${id}-Default`, {
                        functionName: `${id}-Default`,
                        runtime: Runtime.NODEJS_20_X,
                        memorySize: 512,
                        timeout: Duration.seconds(100),
                        entry: '../src/cdk/subscription/subscription-api-default.handler.ts',
                        handler: 'subscriptionApiDefaultHandler',
                    })
                ),
            },
            ...props,
        })

        const { subscriptionStore } = props

        const onConnectFunction = new NodejsFunction(this, `${id}-OnConnect`, {
            functionName: `${id}-OnConnect`,
            runtime: Runtime.NODEJS_20_X,
            memorySize: 512,
            timeout: Duration.seconds(100),
            entry: '../src/cdk/subscription/subscription-api-connect.handler.ts',
            handler: 'subscriptionApiConnectHandler',
        })

        subscriptionStore.grantReadWriteData(onConnectFunction)

        const onDisconnectFunction = new NodejsFunction(this, `${id}-OnDisconnect`, {
            functionName: `${id}-OnDisconnect`,
            runtime: Runtime.NODEJS_20_X,
            memorySize: 512,
            timeout: Duration.seconds(100),
            entry: '../src/cdk/subscription/subscription-api-disconnect.handler.ts',
            handler: 'subscriptionApiDisconnectHandler',
        })

        subscriptionStore.grantReadWriteData(onDisconnectFunction)

        this.addRoute('$connect', {
            integration: new WebSocketLambdaIntegration(`${id}-OnConnectWebsocketIntegration`, onConnectFunction),
        })

        this.addRoute('$disconnect', {
            integration: new WebSocketLambdaIntegration(`${id}-OnConnectWebsocketIntegration`, onDisconnectFunction),
        })

        new WebSocketStage(this, `${this}-WebsocketStage`, {
            autoDeploy: true,
            stageName: 'prod',
            webSocketApi: this,
        })
    }
}
