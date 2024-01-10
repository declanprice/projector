import { SQSEvent } from 'aws-lambda'
import { EventHandlerProps } from './event-handler.decorator'
import { commitStoreOperations, flushStoreOperations } from '../util/store-operations'

export type HandleEvent = {
    handle: (event: any) => Promise<any>
}

export const eventHandler = async (instance: HandleEvent, props: EventHandlerProps, event: SQSEvent) => {
    console.log(event)

    for (const record of event.Records) {
        flushStoreOperations()
        await instance.handle(JSON.parse(record.body))
        await commitStoreOperations()
    }
}
