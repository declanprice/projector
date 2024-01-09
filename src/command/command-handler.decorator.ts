import { ObjectSchema, symbol } from 'valibot'
import { commandHandler } from './command.handler'
import { APIGatewayProxyEventV2, SQSEvent } from 'aws-lambda'
import 'reflect-metadata'

const COMMAND_HANDLER_METADATA = symbol('COMMAND_HANDLER_METADATA')

type CommandHandlerDecoratorProps = {
    path: string
    method?: 'POST' | 'PUT'
    schema?: ObjectSchema<any>
}

export const CommandHandler = (props: CommandHandlerDecoratorProps): ClassDecorator => {
    return (constructor: any) => {
        Reflect.defineMetadata(COMMAND_HANDLER_METADATA, props, constructor)

        constructor.prototype.commandHandler = (event: APIGatewayProxyEventV2 | SQSEvent) => {
            return commandHandler(new constructor(), event)
        }
    }
}

export const getCommandHandlerProps = (handler: any): CommandHandlerDecoratorProps => {
    const metadata = Reflect.getMetadata(COMMAND_HANDLER_METADATA, handler)

    if (!metadata) throw new Error(`failed to get metadata for ${handler.name}`)

    return metadata
}
