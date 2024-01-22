import { Process, ProcessContext, StartProcess } from '../../src/process'
import { CustomerRegisteredEvent } from './register-customer-command.handler'
import { ChangeCustomerNameCommand } from './change-customer-name-command.handler'
import outbox from '../../src/outbox/outbox.store'

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
        context.save({
            customerId: context.event.customerId,
        })

        context.associate('213')

        outbox.command(new ChangeCustomerNameCommand(context.event.customerId, 'changed', 'via-process'))

        console.log('invoked onRegistered process handler')
    }
}
