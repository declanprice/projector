import { HandleQuery, QueryHandler } from '../../src/query'
import { CustomerProjection } from './customer.projection'
import { Store } from '../../src/store/store'
import { QueryMessage } from '../../src/query/query-message'

@QueryHandler({
    path: '/customers/{id}',
})
export class GetCustomerByIdQueryHandler implements HandleQuery {
    readonly store = new Store('Projections')

    async handle(query: QueryMessage<any>) {
        return this.store.get<CustomerProjection>(query.params.id)
    }
}
