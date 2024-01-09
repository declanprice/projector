import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { CommandBus, CommandHandlerFunction, EventBus, RestApi } from '../../src/cdk'
import { RegisterCustomerHandler } from '../src/register-customer.handler'
import { QueryHandlerFunction } from '../../src/cdk/handlers/query-handler'
import { GetCustomerByIdHandler } from '../src/get-customer-by-id.handler'

export class AppStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        const eventBus = new EventBus(this, 'EventBus', {
            eventBusName: 'EventBus',
        })

        const commandBus = new CommandBus(this, 'CommandBus', {
            topicName: 'CommandBus',
        })

        const restApi = new RestApi(this, 'RestApi', {
            apiName: 'RestApi',
        })

        new CommandHandlerFunction(this, RegisterCustomerHandler, {
            restApi,
            commandBus,
            entry: 'src/register-customer.handler.ts',
        })

        new QueryHandlerFunction(this, GetCustomerByIdHandler, {
            restApi,
            entry: 'src/get-customer-by-id.handler.ts',
        })
    }
}
