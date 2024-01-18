import { TransactWriteItem } from '@aws-sdk/client-dynamodb'
import { ProcessAssociationItem, ProcessItem } from './process.item'
import { EventBusMessage } from '../event'
import { DynamoStore } from '../util/dynamo-store'
import { marshall } from '@aws-sdk/util-dynamodb'
import { beginsWith } from '@aws/dynamodb-expressions'

export class ProcessContext<Data, Event> {
    private readonly PROCESS_STORE_NAME = process.env.PROCESS_STORE_NAME as string

    private readonly store = new DynamoStore(this.PROCESS_STORE_NAME)

    constructor(
        private readonly processItem: ProcessItem<Data>,
        private readonly eventBusMessage: EventBusMessage<Event>
    ) {}

    get type(): string {
        return this.eventBusMessage.type
    }

    get event(): Event {
        return this.eventBusMessage.data
    }

    get data(): Data {
        return this.processItem.data
    }

    async save(data: Data) {
        const item: ProcessItem<any> = {
            ...this.processItem,
            timestamp: new Date().toISOString(),
            data,
        }

        return this.store.save(item)
    }

    saveTx(data: Data): TransactWriteItem {
        const item: ProcessItem<any> = {
            ...this.processItem,
            timestamp: new Date().toISOString(),
            data,
        }

        return this.store.saveTx(item)
    }

    async associate(associationId: string) {
        const item: ProcessAssociationItem = {
            pk: associationId,
            sk: `Association|${this.processItem.processId}`,
            processId: this.processItem.processId,
            associationId,
        }

        return this.store.save(item)
    }

    associateTx(associationId: string): TransactWriteItem {
        const item: ProcessAssociationItem = {
            pk: associationId,
            sk: `Association|${this.processItem.processId}`,
            processId: this.processItem.processId,
            associationId,
        }

        return this.store.saveTx(item)
    }

    async unassociate(associationId: string) {
        return this.store.delete(associationId, `Association|${this.processItem.processId}`)
    }

    unassociateTx(associationId: string): TransactWriteItem {
        return this.store.deleteTx(associationId, `Association|${this.processItem.processId}`)
    }
}
