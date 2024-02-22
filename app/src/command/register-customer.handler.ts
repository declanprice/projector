import { v4 } from 'uuid'
import { addMinutes } from 'date-fns'
import { Customer } from './customer.aggregate'
import { CommandHandler, CommandMessage, HandleCommand } from '../../../src/command'
import { SchedulerStore } from '../../../src/store/scheduler/scheduler.store'
import { SubscriptionBus } from '../../../src/subscription/subscription-bus'
import { Saga } from '../../../src/saga/saga'
import { AggregateStore } from '../../../src/store/aggregate/aggregate.store'
import { transactWriteItems } from '../../../src/store'
import { OutboxStore } from '../../../src/store/outbox/outbox.store'
import { OutboxItem, OutboxItemStatus } from '../../../src/store/outbox/outbox.item'
import { ScheduledItem } from '../../../src/store/scheduler/scheduled.item'
import { notExists } from '@declanprice/dynostore'

@CommandHandler({
    path: '/customers',
})
export class RegisterCustomerHandler implements HandleCommand {
    readonly store = new AggregateStore('Aggregates')
    readonly scheduler = new SchedulerStore('Scheduler')
    readonly outbox = new OutboxStore('Outbox')

    async validate(command: CommandMessage<any>) {}

    async handle(command: CommandMessage<any>) {
        const customerId = '1'

        const customer: Customer = {
            id: customerId,
            type: 'Customer',
            customerId: customerId,
            firstName: command.data.firstName,
            lastName: command.data.lastName,
            version: 0,
        }

        const event: OutboxItem = {
            id: v4(),
            type: 'CustomerRegistered',
            status: OutboxItemStatus.PENDING,
            data: customer,
        }

        // const scheduledEvent: ScheduledItem = {
        //     id: scheduledTaskId,
        //     type: 'CustomerRegistered',
        //     scheduledAt: addMinutes(new Date(), 1).toISOString(),
        //     data: customer,
        // }

        await transactWriteItems(
            this.store.put().item(customer).condition(notExists('id')).tx(),
            this.outbox.put().item(event).tx()
        )

        return {
            customerId,
        }
    }
}
