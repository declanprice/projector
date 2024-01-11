import { EventHandlerGroup } from '../../src/event'
import { Customer, CustomerRegisteredEvent } from './customer.aggregate'
import projection from '../../src/projection/projection.store'
import { CustomerProjection } from './customer.projection'
import { EventHandler } from '../../src/event/event-handler.decorator'

@EventHandlerGroup({
    batchSize: 10,
})
export class CustomerRegisteredEventHandler {
    @EventHandler(CustomerRegisteredEvent)
    async handleRegistered(event: CustomerRegisteredEvent, data: Customer) {
        await projection.save(new CustomerProjection(data))
    }
}
