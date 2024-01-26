import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { isHttpEvent } from '../util/is-http-event'
import { Command, CommandInvocationType } from './command.type'
import { isSfnEvent, SfnEvent } from '../util/sfn-utils'
import { CommandHandlerProps } from './command-handler.decorator'
import { parse } from 'valibot'

export type HandleCommand = {
    handle: (command?: any) => Promise<any>
}

export const commandHandler = async (
    classInstance: HandleCommand,
    props: CommandHandlerProps,
    event: APIGatewayProxyEventV2 | SfnEvent
) => {
    if (isHttpEvent(event)) {
        let body = JSON.parse(event?.body || '{}')

        if (props.schema) {
            try {
                body = parse(props.schema, body)
            } catch (error: any) {
                return {
                    statusCode: 400,
                    body: 'body failed schema validation.',
                }
            }
        }

        const message: Command<any> = {
            invocationType: CommandInvocationType.HTTP,
            timestamp: new Date().toISOString(),
            data: body,
        }

        return classInstance.handle(message)
    }

    if (isSfnEvent(event)) {
        let input = event?.input || {}

        if (props.schema) {
            input = parse(props.schema, input)
        }

        const message: Command<any> = {
            invocationType: CommandInvocationType.SAGA,
            timestamp: new Date().toISOString(),
            taskToken: event?.taskToken,
            data: input,
        }

        return classInstance.handle(message)
    }

    throw new Error(
        `[INVALID COMMAND INVOCATION TYPE] - only http or valid structured saga state machine invocations are allowed`
    )
}
