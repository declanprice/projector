import { object, Output, string } from 'valibot'
import aggregate from '../../src/aggregate/aggregate.store'
import { Customer, CustomerRegisteredEvent } from './customer.aggregate'
import { CommandHandler, HandleCommand } from '../../src/command'

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

        await aggregate.apply(new Customer(), event)
    }
}
