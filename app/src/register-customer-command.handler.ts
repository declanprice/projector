import { object, Output, parse, string } from 'valibot'
import { v4 } from 'uuid'
import { transactWriteItems } from '@declanprice/dynostore'
import { addMinutes } from 'date-fns'
import { Customer } from './customer.aggregate'
import { CommandMessage, CommandHandler, HandleCommand } from '../../src/command'
import { SchedulerStore } from '../../src/store/scheduler/scheduler.store'
import { SubscriptionBus } from '../../src/subscription/subscription-bus'
import { Saga } from '../../src/saga/saga'
import { AggregateStore } from '../../src/store/aggregate/aggregate.store'

const RegisterCustomerSchema = object({
    firstName: string(),
    lastName: string(),
})

type RegisterCustomerCommand = CommandMessage<Output<typeof RegisterCustomerSchema>>

@CommandHandler({
    path: '/customers',
})
export class RegisterCustomerCommandHandler implements HandleCommand {
    readonly store = new AggregateStore('Aggregates')
    readonly scheduler = new SchedulerStore('Scheduler')
    readonly subscriptionBus = new SubscriptionBus('SubscriptionBus')
    readonly saga = new Saga('SagaHandler')

    async validate(command: RegisterCustomerCommand) {
        parse(RegisterCustomerSchema, command.data)
    }

    async handle(command: RegisterCustomerCommand) {
        const customerId = '1'
        const scheduledTaskId = v4()

        const customer: Customer = {
            id: customerId,
            type: 'Customer',
            customerId: customerId,
            firstName: command.data.firstName,
            lastName: command.data.lastName,
            scheduledTaskId,
            version: 0,
        }

        await transactWriteItems(
            this.store.put().item(customer).tx(),
            this.scheduler.schedule(customerId, 'test-schedule', customer, addMinutes(new Date(), 1)).tx()
        )
    }
}
