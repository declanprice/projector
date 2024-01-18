import { Process, ProcessContext, StartProcess } from '../../src/process'
import { CustomerRegisteredEvent } from './register-customer-command.handler'
import { transaction } from '../../src/util/dynamo-store-operations'
import outbox from '../../src/outbox/outbox.store'
import { ChangeCustomerNameCommand } from './change-customer-name-command.handler'

type CustomerProcessData = {
    customerId?: string
}

type CustomerProcessContext = ProcessContext<CustomerProcessData, CustomerRegisteredEvent>

@Process({
    batchSize: 10,
    defaultKey: 'customerId',
})
export class CustomerProcessHandler {
    @StartProcess(CustomerRegisteredEvent)
    async onRegistered(context: CustomerProcessContext) {
        const save = context.saveTx({
            customerId: context.event.customerId,
        })

        const changeName = outbox.commandTx(
            new ChangeCustomerNameCommand(context.event.customerId, 'changed', 'via-process')
        )

        await transaction(save, changeName)

        console.log('invoked onRegistered process handler')
    }
}
