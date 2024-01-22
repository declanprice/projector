import { TransactWriteItem } from '@aws-sdk/client-dynamodb'
import { ProcessAssociationItem, ProcessItem } from './process.item'
import { EventBusMessage } from '../event'
import { Store } from '../store/store'

export class ProcessContext<Data, Event> {
    private readonly PROCESS_STORE_NAME = process.env.PROCESS_STORE_NAME as string

    private readonly store = new Store(this.PROCESS_STORE_NAME)

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

    save(data: Data): TransactWriteItem {
        const item = new ProcessItem<Data>(this.processItem.processId, data)

        return this.store.save(item)
    }

    async associate(associationId: string) {
        const item = new ProcessAssociationItem(this.processItem.processId, associationId)

        return this.store.save(item)
    }

    async unassociate(associationId: string) {
        return this.store.delete(ProcessItem, associationId, `Association|${this.processItem.processId}`)
    }
}
