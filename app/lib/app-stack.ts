import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import {
    CommandBus,
    CommandHandler,
    EventBus,
    QueryHandler,
    StateStorePublisher,
    StateStore,
    OutboxStore,
    OutboxStorePublisher,
    HandlerApi,
    EventHandler,
    ProjectionStore,
} from '../../src/cdk'
import { RegisterCustomerCommandHandler } from '../src/register-customer.command-handler'
import { GetCustomerByIdQueryHandler } from '../src/get-customer-by-id.query-handler'
import { CustomerRegisteredEventHandler } from '../src/customer-registered.event-handler'
import { CustomerProjection } from '../src/customer.projection'

export class AppStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        const eventBus = new EventBus(this, 'EventBus', {
            eventBusName: 'EventBus',
        })

        const commandBus = new CommandBus(this, 'CommandBus', {
            topicName: 'CommandBus',
        })

        const handlerApi = new HandlerApi(this, 'RestApi', {
            apiName: 'RestApi',
        })

        /** State Store **/
        const stateStore = new StateStore(this, 'StateStore', {
            tableName: 'StateStore',
        })

        new StateStorePublisher(this, 'StateStorePublisher', {
            stateStore,
        })

        /** Outbox Store **/
        const outboxStore = new OutboxStore(this, 'OutboxStore', {
            tableName: 'OutboxStore',
        })

        new OutboxStorePublisher(this, 'OutboxStorePublisher', {
            commandBus,
            eventBus,
            outboxStore,
        })

        /** Projection Stores **/
        const customerProjection = new ProjectionStore(this, CustomerProjection)

        /** Handlers **/
        new CommandHandler(this, RegisterCustomerCommandHandler, {
            handlerApi,
            commandBus,
            stateStore,
            entry: 'src/register-customer.command-handler.ts',
        })

        new QueryHandler(this, GetCustomerByIdQueryHandler, {
            handlerApi,
            projectionStores: [customerProjection],
            entry: 'src/get-customer-by-id.query-handler.ts',
        })

        // new EventHandler(this, CustomerRegisteredEventHandler, {
        //     eventBus,
        //     projectionStores: [customerProjection],
        //     entry: 'src/customer-registered.event-handler.ts',
        // })
    }
}
