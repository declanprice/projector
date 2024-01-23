import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import {
    EventBus,
    AggregateStorePublisher,
    AggregateStore,
    OutboxStore,
    OutboxStorePublisher,
    HandlerApi,
    CommandHandler,
    SchedulerStore,
    SchedulerStorePublisher,
    EventHandler,
} from '../../src/cdk'
import { RegisterCustomerCommandHandler } from '../src/register-customer-command.handler'
import { CustomerRegisteredEventHandler } from '../src/customer-registered-event.handler'

export class AppStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        const eventBus = new EventBus(this, 'EventBus', {
            eventBusName: 'EventBus',
        })

        const handlerApi = new HandlerApi(this, 'RestApi', {
            apiName: 'RestApi',
        })

        const aggregateStore = new AggregateStore(this, 'Aggregates')
        new AggregateStorePublisher(this, 'AggregatesPublisher', {
            eventBus,
            aggregateStore,
        })

        const schedulerStore = new SchedulerStore(this, 'Scheduler')
        new SchedulerStorePublisher(this, 'SchedulerPublisher', {
            eventBus,
            schedulerStore,
        })

        const outboxStore = new OutboxStore(this, 'Outbox')
        new OutboxStorePublisher(this, 'OutboxPublisher', {
            eventBus,
            outboxStore,
        })

        // const projectionStore = new ProjectionStore(this, 'Projections')

        /** Handlers **/
        new CommandHandler(this, RegisterCustomerCommandHandler, {
            handlerApi,
            aggregateStore,
            schedulerStore,
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

        new EventHandler(this, CustomerRegisteredEventHandler, {
            eventBus,
            entry: 'src/customer-registered-event.handler.ts',
        })
    }
}
