import { APIGatewayProxyEventV2, SQSEvent } from 'aws-lambda'
import { QueryHandlerDecoratorProps } from './query-handler.decorator'
import { isHttpEvent } from '../util/is-http-event'
import { parse } from 'valibot'
import { QueryMessage } from './query-message'
import { CommandMessage } from '../command'

export type HandleQuery = {
    validate?: (message: QueryMessage<any>) => Promise<any>
    handle: (message: QueryMessage<any>) => Promise<any>
}

export const queryHandler = async (
    classInstance: HandleQuery,
    props: QueryHandlerDecoratorProps,
    event: APIGatewayProxyEventV2 | SQSEvent
) => {
    if (isHttpEvent(event)) {
        const isGet = props?.method !== 'POST'

        let query = isGet ? event.queryStringParameters : JSON.parse(event?.body || '{}')

        const message: QueryMessage<any> = {
            params: event.pathParameters,
            query,
        }

        if (classInstance.validate) {
            await classInstance.validate(message)
        }

        return classInstance.handle(message)
    }
}
