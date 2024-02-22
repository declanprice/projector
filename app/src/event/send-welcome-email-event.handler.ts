import { EventGroup, EventHandler } from '../../../src/event/event-group.decorator'

import { EventMessage } from '../../../src/event/event-message.type'

@EventGroup({
    batchSize: 10,
})
export class SendWelcomeEmailEventHandler {
    @EventHandler('CustomerRegistered')
    onRegistered(event: EventMessage<any>) {
        console.log('[CustomerRegistered] event received - ', event)

        // send welcome email logic.
    }
}
