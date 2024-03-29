import { ObjectSchema, symbol } from 'valibot'
import { commandHandler } from './command.handler'
import { APIGatewayProxyEventV2, SQSEvent } from 'aws-lambda'
import 'reflect-metadata'
import { Type } from '../util/type'

const COMMAND_HANDLER_METADATA = symbol('COMMAND_HANDLER_METADATA')

export type CommandHandlerProps = {
    path?: string
    method?: 'POST' | 'PUT'
}

export const CommandHandler = (props: CommandHandlerProps = {}): ClassDecorator => {
    return (constructor: any) => {
        Reflect.defineMetadata(COMMAND_HANDLER_METADATA, props, constructor)

        constructor.prototype.commandHandler = (event: APIGatewayProxyEventV2) => {
            console.log(`[COMMAND HANDLER EVENT] - ${JSON.stringify(event, null, 2)}`)
            return commandHandler(new constructor(), props, event)
        }
    }
}

export const getCommandHandlerProps = (handler: any): CommandHandlerProps => {
    const metadata = Reflect.getMetadata(COMMAND_HANDLER_METADATA, handler)

    if (!metadata) throw new Error(`failed to get metadata for ${handler.name}`)

    return metadata
}
