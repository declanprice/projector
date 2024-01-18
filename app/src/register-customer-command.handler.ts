import { object, Output, string } from 'valibot'
import aggregate from '../../src/aggregate/aggregate.store'
import { Customer } from './customer.aggregate'
import { CommandHandler, HandleCommand } from '../../src/command'
import { transaction } from '../../src/util/dynamo-store-operations'
import outbox from '../../src/outbox/outbox.store'
import { v4 } from 'uuid'

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
    async handle(command: Output<typeof RegisterCustomerSchema>) {
        const customer = new Customer({
            customerId: v4(),
            firstName: 'Declan',
            lastName: 'Price',
        })

        const event = new CustomerRegisteredEvent(customer.customerId, customer.firstName, customer.lastName)

        await transaction(aggregate.saveTx(customer), outbox.eventTx(event))
    }
}
