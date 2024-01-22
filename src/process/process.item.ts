import { StoreItem } from '../store/store.item'

export class ProcessItem<Data> extends StoreItem {
    constructor(
        readonly processId: string,
        readonly data: Data
    ) {
        super(processId, 'PROCESS')
    }

    fromItem(item: any): any {
        return new ProcessItem(item.processId, item.data)
    }
}

export class ProcessAssociationItem extends StoreItem {
    constructor(
        readonly processId: string,
        readonly associationId: string
    ) {
        super(associationId, `Association|${processId}`)
    }

    fromItem(item: any): any {
        return new ProcessItem(item.processId, item.associationId)
    }
}
