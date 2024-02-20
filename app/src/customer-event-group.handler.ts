import { EventGroup, EventHandler } from '../../src/event/event-group.decorator'
import { EventMessage } from '../../src/event/event-message.type'

@EventGroup({
    batchSize: 10,
})
export class CustomerEventGroup {
    @EventHandler('CustomerRegistered')
    onRegistered(event: EventMessage<any>) {
        console.log('customer registered event message - ', event)
    }
}
