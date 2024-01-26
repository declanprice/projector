import { Customer } from './customer.aggregate'
import { CustomerProjection } from './customer.projection'
import { ChangeMessage, ChangeHandler, ChangeHandlerGroup, ChangeType } from '../../src/event'
import { Store } from '../../src/store/store'
import { commit } from '../../src/store/store-operations'
import { SubscriptionBus } from '../../src/subscription/subscription-bus'

@ChangeHandlerGroup({
    batchSize: 10,
})
export class CustomerProjectionChangeHandler {
    readonly store = new Store('Projections')
    readonly subscriptionBus = new SubscriptionBus('SubscriptionBus')

    @ChangeHandler(Customer, ChangeType.INSERT)
    async onCreate(change: ChangeMessage<Customer>) {
        console.log('INSERT CHANGE', change)
        const projection = new CustomerProjection(change.data.customerId, change.data.firstName, change.data.lastName)
        await commit(this.store.save(projection))
        await this.subscriptionBus.emit('customer.updates', projection)
    }

    @ChangeHandler(Customer, ChangeType.MODIFY)
    async onUpdate(change: ChangeMessage<Customer>) {
        console.log('MODIFY CHANGE', change)
        const projection = new CustomerProjection(change.data.customerId, change.data.firstName, change.data.lastName)
        await commit(this.store.save(projection))
    }

    @ChangeHandler(Customer, ChangeType.REMOVE)
    async onDelete(change: ChangeMessage<Customer>) {
        console.log('REMOVE CHANGE', change)
        await commit(this.store.delete(change.data.customerId))
    }
}
