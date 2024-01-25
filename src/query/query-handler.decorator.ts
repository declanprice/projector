import { ObjectSchema, symbol } from 'valibot'
import { APIGatewayProxyEventV2, SQSEvent } from 'aws-lambda'
import 'reflect-metadata'
import { queryHandler } from './query.handler'

const QUERY_HANDLER_METADATA = symbol('QUERY_HANDLER_METADATA')

export type QueryHandlerDecoratorProps = {
    path: string
    method?: 'GET' | 'POST'
    schema?: ObjectSchema<any>
}

export const QueryHandler = (props: QueryHandlerDecoratorProps): ClassDecorator => {
    return (constructor: any) => {
        Reflect.defineMetadata(QUERY_HANDLER_METADATA, props, constructor)

        constructor.prototype.queryHandler = (event: APIGatewayProxyEventV2 | SQSEvent) => {
            console.log(`[QUERY HANDLER EVENT] - ${JSON.stringify(event, null, 2)}`)
            return queryHandler(new constructor(), props, event)
        }
    }
}

export const getQueryHandlerProps = (handler: any): QueryHandlerDecoratorProps => {
    const metadata = Reflect.getMetadata(QUERY_HANDLER_METADATA, handler)

    if (!metadata) throw new Error(`failed to get metadata for ${handler.name}`)

    return metadata
}
