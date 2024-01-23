import { StoreItem } from '../store.item'

export class ScheduledItem extends StoreItem {
    constructor(
        readonly id: string,
        readonly type: string,
        readonly data: any,
        readonly scheduledAt: string
    ) {
        super(id)
    }

    fromItem(item: any): any {
        return new ScheduledItem(item.id, item.type, item.data, item.scheduledAt)
    }
}
