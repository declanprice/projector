import { StoreItem } from '../store.item'

export abstract class EventItem extends StoreItem {
    readonly type = this.constructor.name

    constructor(readonly id: string) {
        super(id)
    }
}
