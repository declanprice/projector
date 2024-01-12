import { Customer } from './customer.aggregate'
import { CustomerProjection } from './customer.projection'

import { ChangeEvent, ChangeHandler, ChangeHandlerGroup, ChangeType } from '../../src/event'
import projection from '../../src/projection/projection.store'

@ChangeHandlerGroup({
    batchSize: 10,
})
export class CustomerProjectionChangeHandler {
    @ChangeHandler(Customer, ChangeType.INSERT)
    async onCreate(change: ChangeEvent<Customer>) {
        console.log('INSERT CHANGE', change)

        await projection.save(
            new CustomerProjection({
                customerId: change.data.customerId,
                firstName: change.data.firstName,
                lastName: change.data.lastName,
            })
        )
    }

    @ChangeHandler(Customer, ChangeType.MODIFY)
    async onUpdate(change: ChangeEvent<Customer>) {
        console.log('MODIFY CHANGE', change)

        await projection.save(
            new CustomerProjection({
                customerId: change.data.customerId,
                firstName: change.data.firstName,
                lastName: change.data.lastName,
            })
        )
    }

    @ChangeHandler(Customer, ChangeType.REMOVE)
    async onDelete(change: ChangeEvent<Customer>) {
        console.log('REMOVE CHANGE', change)
    }
}
