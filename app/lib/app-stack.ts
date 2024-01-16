import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import {
    CommandBus,
    CommandHandler,
    EventBus,
    QueryHandler,
    AggregateStorePublisher,
    AggregateStore,
    OutboxStore,
    OutboxStorePublisher,
    HandlerApi,
    ProjectionStore,
    ChangeHandler,
    EventHandler,
} from '../../src/cdk'
import { RegisterCustomerCommandHandler } from '../src/register-customer.command-handler'
import { GetCustomerByIdQueryHandler } from '../src/get-customer-by-id.query-handler'
import { CustomerProjection } from '../src/customer.projection'
import { CustomerProjectionChangeHandler } from '../src/customer-projection.change.handler'
import { CustomerRegisteredEventHandler } from '../src/customer-registered.event-handler'

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

        /** Aggregate Store **/
        const aggregateStore = new AggregateStore(this, 'AggregateStore', {
            tableName: 'AggregateStore',
        })

        new AggregateStorePublisher(this, 'AggregateStorePublisher', {
            eventBus,
            aggregateStore,
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
            aggregateStore,
            outboxStore,
            entry: 'src/register-customer.command-handler.ts',
        })

        new QueryHandler(this, GetCustomerByIdQueryHandler, {
            handlerApi,
            projectionStores: [customerProjection],
            entry: 'src/get-customer-by-id.query-handler.ts',
        })

        new ChangeHandler(this, CustomerProjectionChangeHandler, {
            eventBus,
            projectionStores: [customerProjection],
            entry: 'src/customer-projection.change.handler.ts',
        })

        new EventHandler(this, CustomerRegisteredEventHandler, {
            eventBus,
            entry: 'src/customer-registered.event-handler.ts',
        })
    }
}
