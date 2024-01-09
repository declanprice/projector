import { APIGatewayProxyEventV2, SQSEvent } from 'aws-lambda'
import { QueryHandlerDecoratorProps } from './query-handler.decorator'
import { isHttpEvent } from '../util/isHttpEvent'

export type HandleQuery = {
    handle: (params: any, query?: any) => Promise<any>
}

export const queryHandler = async (classInstance: HandleQuery, props: QueryHandlerDecoratorProps, event: APIGatewayProxyEventV2 | SQSEvent) => {
    console.log(event)

    if (isHttpEvent(event)) {
        return classInstance.handle(event?.pathParameters || {}, props.method === 'POST' ? JSON.parse(event?.body || '{}') : event?.queryStringParameters || {})
    }
}
