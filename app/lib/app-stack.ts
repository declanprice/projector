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
    ProcessStore,
    ProcessHandler,
} from '../../src/cdk'
import { RegisterCustomerCommandHandler } from '../src/register-customer-command.handler'
import { GetCustomerByIdQueryHandler } from '../src/get-customer-by-id-query.handler'
import { CustomerProjectionChangeHandler } from '../src/customer-projection-change.handler'
import { CustomerRegisteredEventHandler } from '../src/customer-registered-event.handler'
import { CustomerProcessHandler } from '../src/customer-process.handler'
import { ChangeCustomerNameCommandHandler } from '../src/change-customer-name-command.handler'

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

        const aggregateStore = new AggregateStore(this, 'Aggregates')

        const outboxStore = new OutboxStore(this, 'Outbox')

        // const processStore = new ProcessStore(this, 'Processes')

        // const customerProjection = new ProjectionStore(this, 'CustomerProjection')

        new AggregateStorePublisher(this, 'AggregateStorePublisher', {
            eventBus,
            aggregateStore,
        })

        new OutboxStorePublisher(this, 'OutboxStorePublisher', {
            commandBus,
            eventBus,
            outboxStore,
        })

        /** Handlers **/
        new CommandHandler(this, RegisterCustomerCommandHandler, {
            handlerApi,
            commandBus,
            aggregateStore,
            outboxStore,
            entry: 'src/register-customer-command.handler.ts',
        })

        // new CommandHandler(this, ChangeCustomerNameCommandHandler, {
        //     commandBus,
        //     aggregateStore,
        //     outboxStore,
        //     entry: 'src/change-customer-name-command.handler.ts',
        // })

        // new QueryHandler(this, GetCustomerByIdQueryHandler, {
        //     handlerApi,
        //     projectionStores: [customerProjection],
        //     entry: 'src/get-customer-by-id-query.handler.ts',
        // })
        //
        // new ChangeHandler(this, CustomerProjectionChangeHandler, {
        //     eventBus,
        //     projectionStores: [customerProjection],
        //     entry: 'src/customer-projection-change.handler.ts',
        // })
        //
        // new EventHandler(this, CustomerRegisteredEventHandler, {
        //     eventBus,
        //     entry: 'src/customer-registered-event.handler.ts',
        // })
        //
        // new ProcessHandler(this, CustomerProcessHandler, {
        //     eventBus,
        //     processStore,
        //     outboxStore,
        //     entry: 'src/customer-process.handler.ts',
        // })
    }
}
