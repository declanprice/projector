import { EventMessage, EventHandler, EventHandlerGroup } from '../../src/event'
import { Event } from '../../src/store/event/event'

export type CustomerRegisteredEvent = {
    customerId: string
} & Event

@EventHandlerGroup({
    batchSize: 10,
})
export class CustomerRegisteredEventHandler {
    @EventHandler('CustomerRegisteredEvent')
    onRegistered(event: EventMessage<CustomerRegisteredEvent>) {
        console.log('handling customer registered event', event)
    }
}
