import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { CommandBus, CommandHandlerFunction, EventBus, OutboxPublisherQueue, OutboxStore, OutboxStorePoller, OutboxStorePublisher, RestApi } from '../../src/cdk'
import { RegisterCustomerHandler } from '../src/register-customer.handler'
import { QueryHandlerFunction } from '../../src/cdk/handlers/query-handler'
import { GetCustomerByIdHandler } from '../src/get-customer-by-id.handler'
import { StateStorePublisher } from '../../src/cdk/publishers/state-store-publisher'
import { StateStore } from '../../src/cdk/stores/state-store'
import { EventStorePublisher } from '../../src/cdk/publishers/event-store.publisher'
import { EventStore } from '../../src/cdk/stores/event-store'

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

        /** Outbox setup **/

        const outboxStore = new OutboxStore(this, 'OutboxStore')

        const outboxPublisherQueue = new OutboxPublisherQueue(this, 'OutboxPublisherQueue')

        new OutboxStorePoller(this, 'OutboxStorePoller', {
            outboxStore,
            outboxPublisherQueue,
        })

        new OutboxStorePublisher(this, 'OutboxStorePublisher', {
            commandBus,
            eventBus,
            outboxStore,
            outboxPublisherQueue,
        })
        /** Outbox setup end **/

        new StateStorePublisher(this, 'StateStorePublisher', {
            stateStore: new StateStore(this, 'StateStore', {
                tableName: 'StateStore',
            }),
        })

        new EventStorePublisher(this, 'EventStorePublisher', {
            eventStore: new EventStore(this, 'EventStore', {
                tableName: 'EventStore',
            }),
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
