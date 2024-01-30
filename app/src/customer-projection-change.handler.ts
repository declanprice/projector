import { Customer } from './customer.aggregate'
import { CustomerProjection } from './customer.projection'
import { ChangeMessage, ChangeHandler, ChangeHandlerGroup, ChangeType } from '../../src/event'
import { commit } from '../../src/store/store-operations'
import { SubscriptionBus } from '../../src/subscription/subscription-bus'
import { ProjectionStore } from '../../src/store/projection/projection.store'

@ChangeHandlerGroup({
    batchSize: 10,
})
export class CustomerProjectionChangeHandler {
    readonly store = new ProjectionStore('Projections')
    readonly subscriptionBus = new SubscriptionBus('SubscriptionBus')

    @ChangeHandler('Customer', ChangeType.INSERT)
    async onCreate(change: ChangeMessage<Customer>) {
        const projection: CustomerProjection = {
            pk: change.data.customerId,
            customerId: change.data.customerId,
            firstName: change.data.firstName,
            lastName: change.data.lastName,
            version: change.data.version,
        }

        await commit(this.store.create(projection))
    }

    @ChangeHandler('Customer', ChangeType.MODIFY)
    async onUpdate(change: ChangeMessage<Customer>) {
        const projection = await this.store.get<CustomerProjection>(change.data.customerId)
        projection.firstName = change.data.firstName
        projection.lastName = change.data.lastName

        if (projection.version > change.version) {
            console.log('[SKIPPING UPDATE] - current version is greater than incoming version.')
            return
        }

        await commit(this.store.save(projection))
    }

    @ChangeHandler('Customer', ChangeType.REMOVE)
    async onDelete(change: ChangeMessage<Customer>) {
        await commit(this.store.delete(change.data.customerId))
    }
}
