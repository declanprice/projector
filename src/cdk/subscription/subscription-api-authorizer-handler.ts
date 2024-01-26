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
import { Effect, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { subscriptionApiAuthorizer } from './subscription-api-authorizer.handler'
import path from 'path'

type SubscriptionHandlerProps = {
    subscriptionApi: SubscriptionApi
    userPoolId: string
    userPoolRegion: string
    appClientId: string
} & Partial<NodejsFunction>

export class SubscriptionApiAuthorizerHandler extends NodejsFunction {
    constructor(scope: Construct, handler: Type<HandleSubscription>, props: SubscriptionHandlerProps) {
        super(scope, handler.name, {
            functionName: handler.name,
            entry: path.join(__dirname, './subscription-api-authorizer.handler.ts'),
            handler: `subscriptionApiAuthorizer`,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(10),
            memorySize: 512,
            ...props,
        })

        this.addEnvironment('USER_POOL_ID', props.userPoolId)
        this.addEnvironment('USER_POOL_REGION', props.userPoolRegion)
        this.addEnvironment('APP_CLIENT_ID', props.appClientId)

        this.addPermission('apig-invoke', {
            principal: new ServicePrincipal('apigateway.amazonaws.com'),
            action: 'lambda:InvokeFunction',
        })
    }
}
