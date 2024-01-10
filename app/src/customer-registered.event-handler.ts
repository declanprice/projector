import { EventHandler, HandleEvent } from '../../src/event'
import { Customer, CustomerRegisteredEvent } from './customer.aggregate'
import { AggregateItem } from '../../src/aggregate/aggregate.item'
import projection from '../../src/projection/projection.store'
import { CustomerProjection } from './customer.projection'

@EventHandler({
    on: [CustomerRegisteredEvent],
})
export class CustomerRegisteredEventHandler implements HandleEvent {
    async handle(type: string, event: CustomerRegisteredEvent, data: Customer) {
        console.log('handling customer registered event', event)

        switch (type) {
            case CustomerRegisteredEvent.name:
                await this.handleRegistered(event, data)
                break
            default:
                console.log('unsupported event type')
                break
        }
    }

    async handleRegistered(event: CustomerRegisteredEvent, data: Customer) {
        await projection.save(new CustomerProjection(data))
    }
}
