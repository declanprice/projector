import { Construct } from 'constructs'
import { AggregateStore, CommandHandler, HandlerApi, SchedulerStore, OutboxStore } from '../../src/cdk'
import { RegisterCustomerHandler } from '../src/command/register-customer.handler'
import { StartSagaHandler, StepOneHandler, StepThreeHandler, StepTwoHandler } from '../src/command/saga/success-steps'
import { ErrorStepOneHandler, ErrorStepTwoHandler } from '../src/command/saga/error-steps'
import { SagaDefinition } from '../../src/cdk/saga/saga-definition'
import { Saga } from '../../src/cdk/saga/saga'
import { ChangeCustomerNameHandler } from '../src/command/change-customer-name.handler'

type CommandResourcesProps = {
    handlerApi: HandlerApi
    outboxStore: OutboxStore
    aggregateStore: AggregateStore
    schedulerStore: SchedulerStore
}

export class CommandResources extends Construct {
    constructor(
        scope: Construct,
        id: string,
        readonly props: CommandResourcesProps
    ) {
        super(scope, id)

        const { handlerApi, aggregateStore, outboxStore, schedulerStore } = props

        new CommandHandler(this, RegisterCustomerHandler, {
            handlerApi,
            outboxStore,
            aggregateStore,
            schedulerStore,
            entry: 'src/command/register-customer.handler.ts',
        })

        new CommandHandler(this, ChangeCustomerNameHandler, {
            handlerApi,
            aggregateStore,
            schedulerStore,
            entry: 'src/command/change-customer-name.handler.ts',
        })
    }

    createSaga = () => {
        const startSaga = new CommandHandler(this, StartSagaHandler, {
            handlerApi: this.props.handlerApi,
            entry: 'src/saga/success-steps.ts',
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
            startBy: startSaga,
            definitionBody: sagaDefinition.create(),
        })
    }
}
