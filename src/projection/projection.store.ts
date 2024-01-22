import { Type } from '../util/type'
import { DynamoQueryBuilder } from '../util/dynamo-query-builder'
import { DynamoStore } from '../util/dynamo-store'
import { ProjectionItem } from './projection.item'

class ProjectionStore {
    readonly store = new DynamoStore()

    async get<E extends ProjectionItem>(type: Type<E>, id: string): Promise<E | null> {
        return this.store.get(type, id, type.name)
    }

    query<I extends ProjectionItem>(type: Type<I>) {
        return new DynamoQueryBuilder(type, type.name)
    }

    async save<I extends ProjectionItem>(item: I) {
        return this.store.save(item)
    }

    saveTx<I extends ProjectionItem>(item: I) {
        return this.store.saveTx(item)
    }
}

const projection = new ProjectionStore()

export default projection
