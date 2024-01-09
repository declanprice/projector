import { HandleQuery, QueryHandler } from '../../src/query'

@QueryHandler({
    path: '/customers/{id}',
})
export class GetCustomerByIdHandler implements HandleQuery {
    async handle(params: any, query: any) {
        return {
            msg: 'hello',
            params,
            query,
        }
    }
}
