import { CommandHandler, HandleCommand } from '../../src/command'

export class ChangeCustomerNameCommand {
    constructor(
        readonly customerId: string,
        readonly firstName: string,
        readonly lastName: string
    ) {}
}

@CommandHandler({ on: ChangeCustomerNameCommand })
export class ChangeCustomerNameCommandHandler implements HandleCommand {
    async handle(command: ChangeCustomerNameCommand) {
        console.log('change customer name command handler invoked', command)
    }
}
