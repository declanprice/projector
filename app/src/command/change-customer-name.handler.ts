import { CommandHandler, CommandMessage, HandleCommand } from '../../../src/command'
import { AggregateStore } from '../../../src/store/aggregate/aggregate.store'
import { increment, set } from '../../../src/store'

@CommandHandler({
    path: '/customers/{customerId}/name',
})
export class ChangeCustomerNameHandler implements HandleCommand {
    readonly store = new AggregateStore('Aggregates')

    async validate(command: CommandMessage<any>) {
        if (!command.params.customerId! || !command.data.firstName || !command.data.lastName) {
            throw new Error('invalid request')
        }
    }

    async handle(command: CommandMessage<any>) {
        await this.store
            .update()
            .key({ id: command.params.customerId, type: 'Customer' })
            .update(
                set('firstName', command.data.firstName),
                set('lastName', command.data.lastName),
                increment('version', 1)
            )
            .exec()
    }
}
