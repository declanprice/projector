import { object, Output, parse, string } from 'valibot'
import { v4 } from 'uuid'
import { addMinutes } from 'date-fns'
import { Customer } from './customer.aggregate'
import { CommandHandler, CommandMessage, HandleCommand } from '../../src/command'
import { SchedulerStore } from '../../src/store/scheduler/scheduler.store'
import { SubscriptionBus } from '../../src/subscription/subscription-bus'
import { Saga } from '../../src/saga/saga'
import { AggregateStore } from '../../src/store/aggregate/aggregate.store'
import { transactWriteItems } from '../../src/store'
import { OutboxStore } from '../../src/store/outbox/outbox.store'
import { OutboxItem, OutboxItemStatus } from '../../src/store/outbox/outbox.item'
import { ScheduledItem } from '../../src/store/scheduler/scheduled.item'

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
    readonly outbox = new OutboxStore('OutboxStore')
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

        const event: OutboxItem = {
            id: v4(),
            type: 'CustomerRegistered',
            status: OutboxItemStatus.PENDING,
            data: customer,
        }

        const scheduledEvent: ScheduledItem = {
            id: scheduledTaskId,
            type: 'CustomerRegistered',
            scheduledAt: addMinutes(new Date(), 1).toISOString(),
            data: customer,
        }

        await transactWriteItems(
            this.store.put().item(customer).tx(),
            this.outbox.put().item(event).tx(),
            this.scheduler.put().item(scheduledEvent).tx()
        )
    }
}
