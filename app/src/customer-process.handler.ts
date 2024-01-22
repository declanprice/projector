import { Process, ProcessContext, StartProcess } from '../../src/process'
import { CustomerRegisteredEvent } from './register-customer-command.handler'
import { ChangeCustomerNameCommand } from './change-customer-name-command.handler'
import { Outbox } from '../../src/outbox'
import { commit } from '../../src/store/store-operations'

type CustomerProcessData = {
    customerId?: string
}

type CustomerProcessContext = ProcessContext<CustomerProcessData, CustomerRegisteredEvent>

@Process({
    batchSize: 10,
    defaultKey: 'customerId',
})
export class CustomerProcessHandler {
    readonly outbox = new Outbox('Outbox')

    @StartProcess(CustomerRegisteredEvent)
    async onRegistered(context: CustomerProcessContext) {
        const { customerId } = context.event

        const save = context.save({
            customerId,
        })

        const command = this.outbox.command(new ChangeCustomerNameCommand(customerId, 'changed', 'via-process'))

        await commit(save, command)
    }
}
