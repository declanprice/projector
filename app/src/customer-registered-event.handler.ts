import { EventMessage, EventHandler, EventHandlerGroup } from '../../src/event'
import { Event } from '../../src/store/event/event'

export class CustomerRegisteredEvent extends Event {
    constructor(readonly customerId: string) {
        super()
    }
}

@EventHandlerGroup({
    batchSize: 10,
})
export class CustomerRegisteredEventHandler {
    @EventHandler(CustomerRegisteredEvent)
    onRegistered(event: EventMessage<CustomerRegisteredEvent>) {
        console.log('handling customer registered event', event)
    }
}
