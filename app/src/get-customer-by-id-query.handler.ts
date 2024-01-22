import { HandleQuery, QueryHandler } from '../../src/query'
import { CustomerProjection } from './customer.projection'
import { Store } from '../../src/store/store'

@QueryHandler({
    path: '/customers/{id}',
})
export class GetCustomerByIdQueryHandler implements HandleQuery {
    readonly store = new Store('CustomerProjection')

    async handle(params: any, query: any) {
        return this.store.get(CustomerProjection, '1')
    }
}
