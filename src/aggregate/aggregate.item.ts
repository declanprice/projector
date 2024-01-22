import { StoreItem } from '../store/store.item'

export abstract class AggregateItem extends StoreItem {
    version: number = 0
    type = this.constructor.name

    constructor(readonly id: string) {
        super(id)
    }
}
