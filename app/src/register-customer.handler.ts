import { object, Output, string } from 'valibot'
import { CommandHandler, HandleCommand } from '../../src/command'

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
        return 'test-success'
    }
}
