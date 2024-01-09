import { HttpApi, HttpApiProps } from 'aws-cdk-lib/aws-apigatewayv2'
import { Construct } from 'constructs'

type RestApiProps = {} & HttpApiProps

export class RestApi extends HttpApi {
    constructor(scope: Construct, id: string, props: RestApiProps) {
        super(scope, id, props)
    }
}
