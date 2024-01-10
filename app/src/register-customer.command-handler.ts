import { object, Output, string } from 'valibot'
import { CommandHandler, HandleCommand } from '../../src/command'
import aggregate from '../../src/aggregate/aggregate.store'
import { Customer } from './customer.aggregate'

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
        return await aggregate.load(Customer, '1')
    }
}
