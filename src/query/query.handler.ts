import { APIGatewayProxyEventV2, SQSEvent } from 'aws-lambda'
import { QueryHandlerDecoratorProps } from './query-handler.decorator'
import { isHttpEvent } from '../util/is-http-event'
import { parse } from 'valibot'
import { QueryMessage } from './query-message'

export type HandleQuery = {
    handle: (params: any, query?: any) => Promise<any>
}

export const queryHandler = async (
    classInstance: HandleQuery,
    props: QueryHandlerDecoratorProps,
    event: APIGatewayProxyEventV2 | SQSEvent
) => {
    if (isHttpEvent(event)) {
        const isGet = props?.method !== 'POST'

        let query = isGet ? event.queryStringParameters : JSON.parse(event?.body || '{}')

        if (props.schema) {
            try {
                query = parse(props.schema, query)
            } catch (error: any) {
                return {
                    statusCode: 400,
                    body: `${isGet ? 'query params' : 'body'} failed schema validation.`,
                }
            }
        }

        const message: QueryMessage<any> = {
            params: event.pathParameters,
            query,
        }

        return classInstance.handle(message)
    }
}
