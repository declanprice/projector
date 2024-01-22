import { object, Output, string } from 'valibot'
import { Customer } from './customer.aggregate'
import { CommandHandler, HandleCommand } from '../../src/command'
import { v4 } from 'uuid'
import { Store } from '../../src/store/store'
import { commit } from '../../src/store/store-operations'
import { Outbox } from '../../src/outbox'

export class CustomerRegisteredEvent {
    constructor(
        readonly customerId: string,
        readonly firstName: string,
        readonly lastName: string
    ) {}
}

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
    readonly outbox = new Outbox('Outbox')

    async handle(command: Output<typeof RegisterCustomerSchema>) {
        const customer = new Customer(v4(), 'Declan', 'Price')

        const event = new CustomerRegisteredEvent(customer.customerId, customer.firstName, customer.lastName)

        await commit(this.store.save(customer), this.outbox.event(event))
    }
}
