import { Customer } from './customer.aggregate'
import { CustomerProjection } from './customer.projection'
import { ChangeEvent, ChangeHandler, ChangeHandlerGroup, ChangeType } from '../../src/event'
import { Store } from '../../src/store/store'
import { commit } from '../../src/store/store-operations'

@ChangeHandlerGroup({
    batchSize: 10,
})
export class CustomerProjectionChangeHandler {
    readonly store = new Store('CustomerProjection')

    @ChangeHandler(Customer, ChangeType.INSERT)
    async onCreate(change: ChangeEvent<Customer>) {
        console.log('INSERT CHANGE', change)
        const projection = new CustomerProjection(change.data.customerId, change.data.firstName, change.data.lastName)
        await commit(this.store.save(projection))
    }

    @ChangeHandler(Customer, ChangeType.MODIFY)
    async onUpdate(change: ChangeEvent<Customer>) {
        console.log('MODIFY CHANGE', change)
        const projection = new CustomerProjection(change.data.customerId, change.data.firstName, change.data.lastName)
        await commit(this.store.save(projection))
    }

    @ChangeHandler(Customer, ChangeType.REMOVE)
    async onDelete(change: ChangeEvent<Customer>) {
        console.log('REMOVE CHANGE', change)
        await commit(this.store.delete(change.data.customerId))
    }
}
