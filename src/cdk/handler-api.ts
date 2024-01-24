import { HttpApi, HttpApiProps } from 'aws-cdk-lib/aws-apigatewayv2'
import { Construct } from 'constructs'

type RestApiProps = {} & Partial<HttpApiProps>

export class HandlerApi extends HttpApi {
    constructor(scope: Construct, id: string, props?: RestApiProps) {
        super(scope, id, {
            apiName: id,
            ...props,
        })
    }
}
