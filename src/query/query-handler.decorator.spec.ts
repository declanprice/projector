import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { QueryHandler } from './query-handler.decorator'
import { HandleQuery } from './query.handler'

const mockHandle = jest.fn().mockImplementation(async (params: any, query: any) => {
    if (query.firstName) {
        return `${query.firstName}`
    }

    return 'empty'
})

@QueryHandler({
    path: 'customers/{1}',
})
class TestQueryHandler implements HandleQuery {
    handle = mockHandle
}

@QueryHandler({
    path: 'customers/{1}',
    method: 'POST',
})
class TestQueryBodyHandler implements HandleQuery {
    handle = mockHandle
}

describe('QueryHandler decorator', () => {
    let httpEvent: APIGatewayProxyEventV2

    beforeEach(() => {
        jest.clearAllMocks()

        httpEvent = {
            version: '',
            routeKey: '',
            rawPath: '',
            rawQueryString: '',
            body: JSON.stringify({
                firstName: 'dec',
                lastName: 'body',
            }),
            cookies: [],
            headers: {},
            queryStringParameters: {
                firstName: 'dec',
                lastName: 'query-string',
            },
            requestContext: {} as any,
            pathParameters: {
                id: '1',
            },
            isBase64Encoded: false,
            stageVariables: undefined,
        }
    })

    it('should attach queryHandler to class prototype', () => {
        expect(TestQueryHandler.prototype).toHaveProperty('queryHandler')
    })

    it('api gateway v2 event - should invoke query handler with valid params', async () => {
        expect(await (TestQueryHandler.prototype as any)['queryHandler'](httpEvent)).toEqual('dec')
        expect(mockHandle).toHaveBeenCalledWith(
            { id: '1' },
            {
                firstName: 'dec',
                lastName: 'query-string',
            }
        )
    })

    it('api gateway v2 event - should invoke query handler with valid query string', async () => {
        expect(await (TestQueryHandler.prototype as any)['queryHandler'](httpEvent)).toEqual('dec')
        expect(mockHandle).toHaveBeenCalledWith(
            { id: '1' },
            {
                firstName: 'dec',
                lastName: 'query-string',
            }
        )
    })

    it('api gateway v2 event - should invoke query handler with valid body', async () => {
        expect(await (TestQueryBodyHandler.prototype as any)['queryHandler'](httpEvent)).toEqual('dec')
        expect(mockHandle).toHaveBeenCalledWith(
            { id: '1' },
            {
                firstName: 'dec',
                lastName: 'body',
            }
        )
    })

    it('api gateway v2 event - should invoke query handler with empty body', async () => {
        httpEvent.queryStringParameters = undefined
        expect(await (TestQueryHandler.prototype as any)['queryHandler'](httpEvent)).toEqual('empty')
        expect(mockHandle).toHaveBeenCalledWith({ id: '1' }, {})
    })

    it('api gateway v2 event - should invoke query handler with empty body', async () => {
        httpEvent.body = undefined
        expect(await (TestQueryBodyHandler.prototype as any)['queryHandler'](httpEvent)).toEqual('empty')
        expect(mockHandle).toHaveBeenCalledWith({ id: '1' }, {})
    })
})
