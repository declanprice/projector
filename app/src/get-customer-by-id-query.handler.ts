import { HandleQuery, QueryHandler } from '../../src/query'
import { CustomerProjection } from './customer.projection'
import { Store } from '../../src/store/store'
import { object, Output, string } from 'valibot'
import { QueryMessage } from '../../src/query/query-message'

const GetByIdQuerySchema = object({
    customerId: string(),
})

@QueryHandler({
    path: '/customers/{id}',
    schema: GetByIdQuerySchema,
})
export class GetCustomerByIdQueryHandler implements HandleQuery {
    readonly store = new Store('Projections')

    async handle(query: QueryMessage<Output<typeof GetByIdQuerySchema>>) {
        return this.store.get(CustomerProjection, query.params.id)
    }
}
