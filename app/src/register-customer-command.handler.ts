import { object, Output, string } from 'valibot'
import { v4 } from 'uuid'
import { Customer } from './customer.aggregate'
import { Command, CommandHandler, HandleCommand } from '../../src/command'
import { SchedulerStore } from '../../src/store/scheduler/scheduler.store'
import { OutboxStore } from '../../src/store/outbox/outbox.store'
import { SubscriptionBus } from '../../src/subscription/subscription-bus'
import { Saga } from '../../src/saga/saga'
import { AggregateStore } from '../../src/store/aggregate/aggregate.store'
import { transactWriteItems } from '@declanprice/dynostore'

const RegisterCustomerSchema = object({
    firstName: string(),
    lastName: string(),
})

@CommandHandler({
    path: '/customers',
    schema: RegisterCustomerSchema,
})
export class RegisterCustomerCommandHandler implements HandleCommand {
    readonly store = new AggregateStore('Aggregates')
    readonly scheduler = new SchedulerStore('Scheduler')
    readonly outbox = new OutboxStore('Outbox')
    readonly subscriptionBus = new SubscriptionBus('SubscriptionBus')
    readonly saga = new Saga('SagaHandler')

    async handle(command: Command<Output<typeof RegisterCustomerSchema>>) {
        const customerId = '1'
        const scheduledTaskId = v4()

        const customer: Customer = {
            type: 'Customer',
            pk: customerId,
            customerId: customerId,
            firstName: command.data.firstName,
            lastName: command.data.lastName,
            scheduledTaskId,
            version: 0,
        }

        await this.store.put().item(customer).exec()
    }
}
