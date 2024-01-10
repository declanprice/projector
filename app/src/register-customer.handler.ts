import { object, Output, string } from 'valibot'
import { CommandHandler, HandleCommand } from '../../src/command'
import aggregate from '../../src/aggregate/aggregate-store'
import { Order } from './customer.aggregate'

const RegisterCustomerSchema = object({
    firstName: string(),
    lastName: string(),
})

@CommandHandler({
    path: '/customers',
    schema: RegisterCustomerSchema,
})
export class RegisterCustomerHandler implements HandleCommand {
    async handle(command: Output<typeof RegisterCustomerSchema>) {
        return await aggregate.load(Order, '1')
    }
}
