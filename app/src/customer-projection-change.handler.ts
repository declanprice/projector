import { eq, increment, notExists, set } from '@declanprice/dynostore'
import { Customer } from './customer.aggregate'
import { CustomerProjection } from './customer.projection'
import { ChangeMessage, ChangeHandler, ChangeHandlerGroup, ChangeType } from '../../src/event'
import { SubscriptionBus } from '../../src/subscription/subscription-bus'
import { ProjectionStore } from '../../src/store/projection/projection.store'

@ChangeHandlerGroup({
    batchSize: 10,
})
export class CustomerProjectionChangeHandler {
    readonly store = new ProjectionStore('Projections')
    readonly subscriptionBus = new SubscriptionBus('SubscriptionBus')

    @ChangeHandler('Customer', [ChangeType.INSERT, ChangeType.MODIFY])
    async onChange(change: ChangeMessage<Customer>) {
        const projection = await this.store.get<CustomerProjection>().key({ pk: change.data.customerId }).exec()

        if (!projection) {
            return this.store
                .put<CustomerProjection>()
                .item({
                    id: change.data.customerId,
                    customerId: change.data.customerId,
                    firstName: change.data.firstName,
                    lastName: change.data.lastName,
                    version: change.data.version,
                })
                .condition(notExists('pk'))
                .exec()
        }

        if (projection.version >= change.version) {
            console.log('[skipping update] - current version is greater than or equal to incoming version.')
            return
        }

        return this.store
            .update()
            .key({ pk: change.data.customerId })
            .update(
                set('firstName', change.data.firstName),
                set('lastName', change.data.lastName),
                increment('version', 1)
            )
            .condition(eq('version', projection.version))
            .exec()
    }

    @ChangeHandler('Customer', ChangeType.REMOVE)
    async onDelete(change: ChangeMessage<Customer>) {
        return this.store.delete().key({ pk: change.data.customerId }).exec()
    }
}
