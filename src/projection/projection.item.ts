import { StoreItem } from '../store/store.item'

export abstract class ProjectionItem extends StoreItem {
    versions: { [name: string]: number } = {}

    constructor(private readonly id: string) {
        super(id)
    }

    get sk(): string {
        return this.constructor.name
    }
}
