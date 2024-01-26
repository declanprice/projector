import { object, Output, string } from 'valibot'
import { v4 } from 'uuid'
import { Customer } from './customer.aggregate'
import { CommandHandler, HandleCommand } from '../../src/command'
import { Store } from '../../src/store/store'
import { SchedulerStore } from '../../src/store/scheduler/scheduler.store'
import { OutboxStore } from '../../src/store/outbox/outbox.store'
import { SubscriptionBus } from '../../src/subscription/subscription-bus'
import { Saga } from '../../src/saga/saga'
import { commit } from '../../src/store/store-operations'
import { CustomerRegisteredEvent } from './customer-registered-event.handler'

const RegisterCustomerSchema = object({
    firstName: string(),
    lastName: string(),
})

@CommandHandler({
    path: '/customers',
    schema: RegisterCustomerSchema,
})
export class RegisterCustomerCommandHandler implements HandleCommand {
    readonly store = new Store('Aggregates')
    readonly scheduler = new SchedulerStore('Scheduler')
    readonly outbox = new OutboxStore('Outbox')
    readonly subscriptionBus = new SubscriptionBus()
    readonly saga = new Saga('SagaHandler')

    async handle(command: Output<typeof RegisterCustomerSchema>) {
        const customerId = v4()
        const scheduledTaskId = v4()
        const customer = new Customer(customerId, 'Dec', 'Price', scheduledTaskId)
        const event = new CustomerRegisteredEvent(customerId)
        await commit(this.store.save(customer), this.outbox.publish(event))
    }
}
