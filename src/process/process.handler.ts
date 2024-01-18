import { getProcessHandlerProps, ProcessHandlerProps, ProcessProps } from './process.decorator'
import { EventBridgeEvent, SQSEvent } from 'aws-lambda'
import { EventBusMessage } from '../event'
import { DynamoStore } from '../util/dynamo-store'
import { ProcessAssociationItem, ProcessItem } from './process.item'
import { transaction } from '../util/dynamo-store-operations'
import { ProcessContext } from './process-context'
import { beginsWith, equals } from '@aws/dynamodb-expressions'
import { parse } from 'valibot'
import { EventBusMessageSchema } from '../event/event-bus-message.type'

const PROCESS_STORE_NAME = process.env.PROCESS_STORE_NAME as string

const store = new DynamoStore(PROCESS_STORE_NAME)

export const processHandler = async (instance: any, props: ProcessProps, event: SQSEvent) => {
    console.log('process handler', event)

    for (const record of event.Records) {
        const body = JSON.parse(record.body) as EventBridgeEvent<any, EventBusMessage<any>>

        const { detail } = body

        const handlerProps = getProcessHandlerProps(detail.type, instance.constructor)

        const associationId = detail.data[handlerProps.key ?? props.defaultKey]

        if (handlerProps.start === true) {
            const processId = detail.messageId

            const started = await startProcessIfNotExists(processId, associationId)

            if (!started) {
                console.log(`[SKIPPING PROCESS START] - process id ${processId} already exists.`)
            }
        }

        const associations = await queryAssociations(associationId)

        for (const association of associations) {
            const process = await store.get<ProcessItem<any>>(association.processId, 'Process')

            if (!process) {
                throw new Error(`[PROCESS NOT FOUND] - failed to find process with id ${association.processId}`)
            }

            const context = new ProcessContext(process, detail)

            await instance[handlerProps.method](context)

            console.log(
                `[PROCESS SUCCESSFULLY EXECUTED] - process with ${association.processId} for association ${association.associationId} has ran successfully.`
            )
        }
    }
}

const queryAssociations = async (associationId: string): Promise<ProcessAssociationItem[]> => {
    const associations = await store
        .query<ProcessAssociationItem>()
        .pk('pk', associationId)
        .sk('sk', beginsWith('Association|'))
        .consistent(true)
        .exec()

    console.log(`found ${associations.data.length} associations for associationId ${associationId}`)

    return associations.data
}

const startProcessIfNotExists = async (processId: string, associationId: string): Promise<ProcessItem<any> | null> => {
    const processItem: ProcessItem<any> = {
        pk: processId,
        sk: `Process`,
        processId,
        data: {},
        timestamp: new Date().toISOString(),
    }

    const processAssociationItem: ProcessAssociationItem = {
        pk: associationId,
        sk: `Association|${processId}`,
        processId,
        associationId,
    }

    try {
        await transaction(store.createTx(processItem), store.createTx(processAssociationItem))
        return processItem
    } catch (error) {
        console.log('transaction error', error)
        return null
    }
}
