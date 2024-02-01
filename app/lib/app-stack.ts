import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import {
    ChangeBus,
    AggregateStorePublisher,
    AggregateStore,
    HandlerApi,
    CommandHandler,
    SchedulerStore,
    SchedulerStorePublisher,
    SubscriptionBus,
    SubscriptionApi,
    SubscriptionStore,
    QueryHandler,
    ProjectionStore,
    ChangeHandler,
    SchedulerHandler,
    SubscriptionHandler,
} from '../../src/cdk'
import { RegisterCustomerCommandHandler } from '../src/register-customer-command.handler'
import { Saga } from '../../src/cdk/saga/saga'
import { StepOneHandler, StepThreeHandler, StepTwoHandler } from '../src/saga/success-steps'
import { ErrorStepOneHandler, ErrorStepTwoHandler } from '../src/saga/error-steps'
import { GetCustomerByIdQueryHandler } from '../src/get-customer-by-id-query.handler'
import { CustomerProjectionChangeHandler } from '../src/customer-projection-change.handler'
import { SagaDefinition } from '../../src/cdk/saga/saga-definition'
import { TestSchedulerHandler } from '../src/test-scheduler.handler'
import { CustomerSubscriptionHandler } from '../src/customer-subscription.handler'

export class AppStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        const changeBus = new ChangeBus(this, 'ChangeBus')

        const subscriptionBus = new SubscriptionBus(this, 'SubscriptionBus')

        const handlerApi = new HandlerApi(this, 'RestApi')

        const subscriptionStore = new SubscriptionStore(this, 'Subscriptions')
        const subscriptionApi = new SubscriptionApi(this, 'SubscriptionApi', {
            subscriptionStore,
        })

        const aggregateStore = new AggregateStore(this, 'Aggregates')
        new AggregateStorePublisher(this, 'AggregatesPublisher', {
            changeBus,
            aggregateStore,
        })

        const schedulerStore = new SchedulerStore(this, 'Scheduler')
        new SchedulerStorePublisher(this, 'SchedulerPublisher', {
            changeBus,
            schedulerStore,
        })

        const projectionStore = new ProjectionStore(this, 'Projections')

        /** Handlers **/
        new CommandHandler(this, RegisterCustomerCommandHandler, {
            handlerApi,
            aggregateStore,
            schedulerStore,
            entry: 'src/register-customer-command.handler.ts',
        })

        new QueryHandler(this, GetCustomerByIdQueryHandler, {
            handlerApi,
            projectionStores: [projectionStore],
            entry: 'src/get-customer-by-id-query.handler.ts',
        })

        new ChangeHandler(this, CustomerProjectionChangeHandler, {
            changeBus,
            projectionStores: [projectionStore],
            entry: 'src/customer-projection-change.handler.ts',
        })

        new SchedulerHandler(this, TestSchedulerHandler, {
            changeBus,
            entry: 'src/test-scheduler.handler.ts',
        })

        new SubscriptionHandler(this, CustomerSubscriptionHandler, {
            subscriptionStore,
            subscriptionApi,
            subscriptionBus,
            entry: 'src/customer-subscription.handler.ts',
        })
    }

    createSaga = (registerCustomer: CommandHandler) => {
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

        const sagaDefinition = new SagaDefinition(this, 'SagaDefinition')

        sagaDefinition.step('StepOne', {
            invoke: stepOne,
            compensate: errorStepOne,
        })

        sagaDefinition.step('StepTwo', {
            invoke: stepTwo,
            compensate: errorStepTwo,
        })

        sagaDefinition.step('StepThree', {
            invoke: stepThree,
        })

        new Saga(this, 'SagaHandler', {
            startBy: registerCustomer,
            definitionBody: sagaDefinition.create(),
        })
    }
}
