import { EventHandler, HandleEvent } from '../../src/event'
import { CustomerRegisteredEvent } from './customer.aggregate'

@EventHandler({
    on: [CustomerRegisteredEvent],
})
export class CustomerRegisteredEventHandler implements HandleEvent {
    async handle(event: CustomerRegisteredEvent) {
        console.log('handling customer registered event', event)
    }
}
