import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { isHttpEvent } from '../util/is-http-event'
import { CommandMessage, CommandInvocationType } from './command.type'
import { isSfnEvent, SfnEvent } from '../util/sfn-utils'
import { CommandHandlerProps } from './command-handler.decorator'
import { parse } from 'valibot'

export type HandleCommand = {
    validate?: (command: CommandMessage<any>) => Promise<any>
    handle: (command: CommandMessage<any>) => Promise<any>
}

export const commandHandler = async (
    classInstance: HandleCommand,
    props: CommandHandlerProps,
    event: APIGatewayProxyEventV2 | SfnEvent
) => {
    if (isHttpEvent(event)) {
        let body = JSON.parse(event?.body || '{}')

        const message: CommandMessage<any> = {
            invocationType: CommandInvocationType.HTTP,
            data: body,
            params: event?.pathParameters || {},
        }

        if (classInstance.validate) {
            await classInstance.validate(message)
        }

        return classInstance.handle(message)
    }

    if (isSfnEvent(event)) {
        let input = event?.input || {}

        const message: CommandMessage<any> = {
            invocationType: CommandInvocationType.SAGA,
            taskToken: event?.taskToken,
            data: input,
            params: {},
        }

        return classInstance.handle(message)
    }

    throw new Error(
        `[INVALID COMMAND INVOCATION TYPE] - only http or valid structured saga state machine invocations are allowed`
    )
}
