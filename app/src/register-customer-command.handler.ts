import { object, Output, string } from 'valibot'
import { v4 } from 'uuid'
import { addMinutes } from 'date-fns'
import { Customer } from './customer.aggregate'
import { CommandHandler, HandleCommand } from '../../src/command'
import { Store } from '../../src/store/store'
import { commit } from '../../src/store/store-operations'
import { SchedulerStore } from '../../src/store/scheduler/scheduler.store'
import { OutboxStore } from '../../src/store/outbox/outbox.store'
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

    async handle(command: Output<typeof RegisterCustomerSchema>) {
        const customerId = v4()
        const scheduledTaskId = v4()

        const customer = new Customer(customerId, 'Declan', 'Price', scheduledTaskId)
        const event = new CustomerRegisteredEvent(customer.customerId)

        await commit(
            this.store.save(customer),
            this.scheduler.schedule(scheduledTaskId, event, addMinutes(new Date(), 10))
        )
    }
}
