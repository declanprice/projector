import { StoreItem } from '../util/dynamo-store'

export abstract class ProjectionItem extends StoreItem {
    versions: { [name: string]: number } = {}

    constructor(private readonly id: string) {
        super(id)
    }

    get sk(): string {
        return this.constructor.name
    }
}
