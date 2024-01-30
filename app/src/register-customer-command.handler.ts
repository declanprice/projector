import { object, Output, string } from 'valibot'
import { v4 } from 'uuid'
import { Customer } from './customer.aggregate'
import { Command, CommandHandler, HandleCommand } from '../../src/command'
import { Store } from '../../src/store/store'
import { SchedulerStore } from '../../src/store/scheduler/scheduler.store'
import { OutboxStore } from '../../src/store/outbox/outbox.store'
import { SubscriptionBus } from '../../src/subscription/subscription-bus'
import { Saga } from '../../src/saga/saga'
import { commit } from '../../src/store/store-operations'
import { AggregateStore } from '../../src/store/aggregate/aggregate.store'

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
        const customerId = v4()
        const scheduledTaskId = v4()

        // const customer: Customer = {
        //     pk: '1',
        //     customerId: '1',
        //     type: 'Customer',
        //     firstName: command.data.firstName,
        //     lastName: command.data.lastName,
        //     scheduledTaskId,
        //     version: 0,
        // }

        const customer = await this.store.get<Customer>('1')
        customer.firstName = 'changed'
        await commit(this.store.save(customer))
        // await commit(this.store.save(customer), this.outbox.publish(event))
    }
}
