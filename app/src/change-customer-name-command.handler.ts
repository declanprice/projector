import { object, Output, string } from 'valibot'
import { Customer } from './customer.aggregate'
import { Command, CommandHandler, HandleCommand } from '../../src/command'
import { AggregateStore } from '../../src/store/aggregate/aggregate.store'
import { eq, increment, set } from '@declanprice/dynostore'

const ChangeCustomerNameSchema = object({
    customerId: string(),
    firstName: string(),
    lastName: string(),
})

@CommandHandler({
    path: '/customers/{id}/name',
    schema: ChangeCustomerNameSchema,
})
export class ChangeCustomerNameCommandHandler implements HandleCommand {
    readonly store = new AggregateStore('Aggregates')

    async handle(command: Command<Output<typeof ChangeCustomerNameSchema>>) {
        const customerId = '1'

        const customer = await this.store.get<Customer>().key({ pk: customerId }).exec()

        if (!customer) {
            throw new Error('customer not found')
        }

        await this.store
            .update()
            .key({ pk: customerId })
            .update(
                set('firstName', command.data.firstName),
                set('lastName', command.data.lastName),
                increment('version', 1)
            )
            .condition(eq('version', customer.version))
            .exec()
    }
}
