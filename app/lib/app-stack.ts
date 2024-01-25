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
    SubscriptionBus,
    SubscriptionHandler,
    SubscriptionApi,
    SubscriptionStore,
} from '../../src/cdk'
import { RegisterCustomerCommandHandler } from '../src/register-customer-command.handler'
import { CustomerSubscriptionHandler } from '../src/customer-subscription.handler'
import { Saga } from '../../src/cdk/saga/saga'
import { StepOneHandler, StepThreeHandler, StepTwoHandler } from '../src/saga/success-steps'
import { ErrorStepOneHandler, ErrorStepTwoHandler } from '../src/saga/error-steps'
import { SendTokenHandler } from '../src/saga/send-token.handler'

export class AppStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        const eventBus = new EventBus(this, 'EventBus')

        const subscriptionBus = new SubscriptionBus(this, 'SubscriptionBus')

        const handlerApi = new HandlerApi(this, 'RestApi')

        const subscriptionStore = new SubscriptionStore(this, 'Subscriptions')
        const subscriptionApi = new SubscriptionApi(this, 'SubscriptionApi', {
            subscriptionStore,
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
        const registerCustomer = new CommandHandler(this, RegisterCustomerCommandHandler, {
            handlerApi,
            aggregateStore,
            schedulerStore,
            outboxStore,
            subscriptionBus,
            entry: 'src/register-customer-command.handler.ts',
        })

        const sendToken = new CommandHandler(this, SendTokenHandler, {
            handlerApi,
            entry: 'src/saga/send-token.handler.ts',
        })

        new SubscriptionHandler(this, CustomerSubscriptionHandler, {
            subscriptionStore,
            subscriptionApi,
            subscriptionBus,
            entry: 'src/customer-subscription.handler.ts',
        })

        const stepOne = new CommandHandler(this, StepOneHandler, {
            entry: 'src/saga/success-steps.ts',
        })

        const stepTwo = new CommandHandler(this, StepTwoHandler, {
            entry: 'src/saga/success-steps.ts',
        })

        const stepThree = new CommandHandler(this, StepThreeHandler, {
            entry: 'src/saga/success-steps.ts',
        })

        const errorStepOne = new CommandHandler(this, ErrorStepOneHandler, {
            entry: 'src/saga/error-steps.ts',
        })

        const errorStepTwo = new CommandHandler(this, ErrorStepTwoHandler, {
            entry: 'src/saga/error-steps.ts',
        })

        const saga = new Saga(this, 'SagaHandler', {
            startBy: registerCustomer,
            allowSendToken: [sendToken],
        })

        saga.step('StepOne', {
            invoke: stepOne,
            compensate: errorStepOne,
        })

        saga.step('StepTwo', {
            invoke: stepTwo,
            compensate: errorStepTwo,
        })

        saga.step('StepThree', {
            invoke: stepThree,
        })

        saga.create()

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
    }
}
