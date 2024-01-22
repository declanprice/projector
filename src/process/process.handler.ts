import { getProcessHandlerProps, ProcessProps } from './process.decorator'
import { EventBridgeEvent, SQSEvent } from 'aws-lambda'
import { EventBusMessage } from '../event'
import { DynamoStore } from '../util/dynamo-store'
import { ProcessAssociationItem, ProcessItem } from './process.item'
import { isConditionCheckError, transaction } from '../util/dynamo-store-operations'
import { ProcessContext } from './process-context'
import { beginsWith } from '@aws/dynamodb-expressions'

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

            if (started === null) {
                console.log(`[SKIPPING PROCESS START] - process id ${processId} already exists.`)
            }
        }

        const associations = await queryAssociations(associationId)

        for (const association of associations) {
            const process = await store.get(ProcessItem, association.processId, 'Process')

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
        .query(ProcessAssociationItem)
        .pk('pk', associationId)
        .sk('sk', beginsWith('Association|'))
        .consistent(true)
        .exec()

    console.log(`found ${associations.data.length} associations for associationId ${associationId}`)

    return associations.data
}

const startProcessIfNotExists = async (processId: string, associationId: string): Promise<ProcessItem<any> | null> => {
    const processItem = new ProcessItem(processId, {})
    const processAssociationItem = new ProcessAssociationItem(processId, associationId)

    try {
        await transaction(store.createTx(processItem), store.createTx(processAssociationItem))
        return processItem
    } catch (error) {
        if (isConditionCheckError(error)) {
            return null
        }
        throw error
    }
}
