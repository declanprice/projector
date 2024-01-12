import { HandleQuery, QueryHandler } from '../../src/query'
import projection from '../../src/projection/projection.store'
import { CustomerProjection } from './customer.projection'

@QueryHandler({
    path: '/customers/{id}',
})
export class GetCustomerByIdQueryHandler implements HandleQuery {
    async handle(params: any, query: any) {
        // return projection.get(CustomerProjection, '1')

        return projection.query(CustomerProjection).pk('id', '1').exec()
    }
}
