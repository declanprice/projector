import { APIGatewayProxyEventV2, SQSEvent } from 'aws-lambda'
import { isHttpEvent } from '../util/isHttpEvent'
import { isSqsEvent } from '../util/isSqsEvent'
import { isSnsMessage } from '../util/isSnsEvent'

export type HandleCommand = {
    handle: (command?: any) => Promise<any>
}

export const commandHandler = async (classInstance: HandleCommand, event: APIGatewayProxyEventV2 | SQSEvent) => {
    console.log(event)

    if (isHttpEvent(event)) {
        return classInstance.handle(JSON.parse(event.body || '{}'))
    }

    if (isSqsEvent(event)) {
        for (const record of event.Records) {
            const body = JSON.parse(record.body)

            if (isSnsMessage(body)) {
                await classInstance.handle(JSON.parse(body.Message))
            }
        }
    }
}
