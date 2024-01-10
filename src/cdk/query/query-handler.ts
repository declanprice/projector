import { Duration } from 'aws-cdk-lib'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { getQueryHandlerProps, HandleQuery } from '../../query'
import { HandlerApi } from '../handler-api'
import { ProjectionStore } from '../projection'

type QueryHandlerProps = {
    handlerApi?: HandlerApi
    projectionStores?: ProjectionStore[]
    entry: string
} & Partial<NodejsFunctionProps>

export class QueryHandler extends NodejsFunction {
    constructor(scope: Construct, handler: { new (...props: any): HandleQuery }, props: QueryHandlerProps) {
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

        const { handlerApi, projectionStores } = props

        if (handlerApi) {
            const metadata = getQueryHandlerProps(handler)

            handlerApi.addRoutes({
                path: metadata.path,
                methods: [metadata?.method === 'POST' ? HttpMethod.POST : HttpMethod.GET],
                integration: new HttpLambdaIntegration(`${handler.name}-HttpIntegration`, this),
            })
        }

        if (projectionStores) {
            for (const projectionStore of projectionStores) {
                projectionStore.grantReadWriteData(this)
            }
        }
    }
}
