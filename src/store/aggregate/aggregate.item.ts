import { StoreItem } from '../store.item'

export abstract class AggregateItem extends StoreItem {
    version: number = 0
    readonly type = this.constructor.name

    constructor(readonly id: string) {
        super(id)
    }
}
