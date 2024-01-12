import { object, Output, string } from 'valibot'
import aggregate from '../../src/aggregate/aggregate.store'
import { Customer } from './customer.aggregate'
import { CommandHandler, HandleCommand } from '../../src/command'
import { transaction } from '../../src/util/store-operations'

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
        const event = new CustomerRegisteredEvent('1', 'declan', 'price')

        await transaction(
            aggregate.saveTx(
                new Customer({
                    customerId: event.customerId,
                    firstName: event.firstName,
                    lastName: event.lastName,
                })
            )
        )
    }
}
