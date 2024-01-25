import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { isHttpEvent } from '../util/is-http-event'
import { Command, CommandInvocationType } from './command.type'
import { isSfnEvent, SfnEvent } from '../util/sfn-utils'

export type HandleCommand = {
    handle: (command?: any) => Promise<any>
}

export const commandHandler = async (classInstance: HandleCommand, event: APIGatewayProxyEventV2 | SfnEvent) => {
    if (isHttpEvent(event)) {
        const message: Command<any> = {
            invocationType: CommandInvocationType.HTTP,
            timestamp: new Date().toISOString(),
            metadata: {},
            data: JSON.parse(event?.body || '{}'),
        }

        return classInstance.handle(message)
    }

    if (isSfnEvent(event)) {
        const message: Command<any> = {
            invocationType: CommandInvocationType.SAGA,
            timestamp: new Date().toISOString(),
            metadata: {
                taskToken: event?.taskToken,
            },
            data: event?.input || {},
        }

        return classInstance.handle(message)
    }

    console.log(`[INVALID COMMAND INVOCATION TYPE] - only http or state machine invocations are allowed`)
}
