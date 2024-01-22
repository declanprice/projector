import { StoreItem } from '../util/dynamo-store'

export abstract class AggregateStoreItem extends StoreItem {
    version: number = 0

    constructor(private readonly id: string) {
        super(id)
    }

    get sk(): string {
        return this.constructor.name
    }
}
