import { APIGatewayProxyEventV2, SQSEvent } from 'aws-lambda'
import { isHttpEvent } from '../util/is-http-event'
import { isSqsEvent } from '../util/is-sqs-event'
import { isSnsMessage } from '../util/is-sns-event'
import { commitStoreOperations, flushStoreOperations } from '../util/store-operations'

export type HandleCommand = {
    handle: (command?: any) => Promise<any>
}

export const commandHandler = async (classInstance: HandleCommand, event: APIGatewayProxyEventV2 | SQSEvent) => {
    console.log(event)

    const invokeHandler = async (command: any) => {
        flushStoreOperations()
        const result = await classInstance.handle(command)
        await commitStoreOperations()
        return result
    }

    if (isHttpEvent(event)) {
        return invokeHandler(JSON.parse(event?.body || '{}'))
    }

    if (isSqsEvent(event)) {
        for (const record of event.Records) {
            const body = JSON.parse(record.body)

            if (isSnsMessage(body)) {
                await invokeHandler(JSON.parse(body.Message))
            }
        }
    }
}
