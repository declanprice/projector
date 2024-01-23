import { EventBusMessage, EventHandler, EventHandlerGroup } from '../../src/event'
import { EventItem } from '../../src/store/event/event.item'

export class CustomerRegisteredEvent extends EventItem {
    constructor(readonly customerId: string) {
        super(customerId)
    }

    fromItem(item: any): any {
        return new CustomerRegisteredEvent(item.customerId)
    }
}

@EventHandlerGroup({
    batchSize: 10,
})
export class CustomerRegisteredEventHandler {
    @EventHandler(CustomerRegisteredEvent)
    onRegistered(event: EventBusMessage<CustomerRegisteredEvent>) {
        console.log('handling customer registered event', event)
    }
}
