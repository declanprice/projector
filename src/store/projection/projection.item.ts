import { StoreItem } from '../store.item'

export abstract class ProjectionItem extends StoreItem {
    versions: { [name: string]: number } = {}

    constructor(readonly id: string) {
        super(id)
    }
}
