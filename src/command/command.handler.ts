import { APIGatewayProxyEventV2, SQSEvent } from 'aws-lambda'
import { isHttpEvent } from '../util/isHttpEvent'
import { isSqsEvent } from '../util/isSqsEvent'
import { isSnsMessage } from '../util/isSnsEvent'
import { commitStoreOperations, flushStoreOperations } from '../util/store-operations'

export type HandleCommand = {
    handle: (command?: any) => Promise<any>
}

export const commandHandler = async (classInstance: HandleCommand, event: APIGatewayProxyEventV2 | SQSEvent) => {
    console.log(event)

    if (isHttpEvent(event)) {
        flushStoreOperations()
        const result = classInstance.handle(JSON.parse(event.body || '{}'))
        await commitStoreOperations()
        return result
    }

    if (isSqsEvent(event)) {
        for (const record of event.Records) {
            const body = JSON.parse(record.body)

            if (isSnsMessage(body)) {
                flushStoreOperations()
                await classInstance.handle(JSON.parse(body.Message))
                await commitStoreOperations()
            }
        }
    }
}
