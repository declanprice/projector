import { eq, increment, notExists, set } from '../../../src/store'
import { Customer } from '../command/customer.aggregate'
import { CustomerProjection } from './customer.projection'
import { ChangeMessage, ChangeHandler, ChangeGroup, ChangeType } from '../../../src/event'
import { ProjectionStore } from '../../../src/store/projection/projection.store'

@ChangeGroup({
    batchSize: 10,
})
export class CustomerProjectionHandler {
    readonly store = new ProjectionStore('Projections')

    @ChangeHandler('Customer', [ChangeType.INSERT, ChangeType.MODIFY])
    async onChange(change: ChangeMessage<Customer>) {
        const projection = await this.store.get<CustomerProjection>().key({ id: change.data.customerId }).exec()

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
                .condition(notExists('id'))
                .exec()
        }

        if (projection.version >= change.version) {
            console.log('[skipping update] - existing version is greater than or equal to incoming version.')
            return
        }

        return this.store
            .update()
            .key({ id: change.data.customerId })
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
        return this.store.delete().key({ id: change.data.customerId }).exec()
    }
}
