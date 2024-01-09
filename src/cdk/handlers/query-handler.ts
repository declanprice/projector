import { Duration } from 'aws-cdk-lib'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { getQueryHandlerProps, HandleQuery } from '../../query'
import { RestApi } from '../rest-api'

type QueryHandlerProps = {
    restApi?: RestApi
} & Partial<NodejsFunctionProps>

export class QueryHandlerFunction extends NodejsFunction {
    constructor(scope: Construct, handler: { new (): HandleQuery }, props: QueryHandlerProps) {
        super(scope, handler.name, {
            functionName: handler.name,
            runtime: Runtime.NODEJS_20_X,
            handler: `index.${handler.name}.prototype.queryHandler`,
            timeout: Duration.seconds(10),
            memorySize: 512,
            bundling: {
                keepNames: true,
            },
            ...props,
        })

        const { restApi } = props

        if (restApi) {
            const metadata = getQueryHandlerProps(handler)

            restApi.addRoutes({
                path: metadata.path,
                methods: [metadata?.method === 'POST' ? HttpMethod.POST : HttpMethod.GET],
                integration: new HttpLambdaIntegration(`${handler.name}-HttpIntegration`, this),
            })
        }
    }
}
