import { EventBusMessage, EventHandler, EventHandlerGroup } from '../../src/event'
import { CustomerRegisteredEvent } from './register-customer.command-handler'

@EventHandlerGroup({
    batchSize: 10,
})
export class CustomerRegisteredEventHandler {
    @EventHandler(CustomerRegisteredEvent)
    onRegistered(event: EventBusMessage<CustomerRegisteredEvent>) {
        console.log('handling customer registered event', event)
    }
}
