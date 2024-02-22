import { HandleQuery, QueryHandler } from '../../../src/query'
import { CustomerProjection } from './customer.projection'
import { QueryMessage } from '../../../src/query/query-message'
import { ProjectionStore } from '../../../src/store/projection/projection.store'

@QueryHandler({
    path: '/customers/{id}',
})
export class GetCustomerByIdHandler implements HandleQuery {
    readonly store = new ProjectionStore('Projections')

    async handle(query: QueryMessage<any>) {
        return this.store.get<CustomerProjection>().key({ id: query.params.id }).exec()
    }
}
