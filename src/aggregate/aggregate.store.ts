import { Type } from '../util/type'
import { TransactWriteItem } from '@aws-sdk/client-dynamodb'
import { AggregateStoreItem } from './aggregate.item'
import { DynamoStore } from '../util/dynamo-store'

class AggregateStore {
    readonly AGGREGATE_STORE_NAME = process.env.AGGREGATE_STORE_NAME as string

    readonly store = new DynamoStore(this.AGGREGATE_STORE_NAME)

    async get<E extends AggregateStoreItem>(type: Type<E>, id: string): Promise<E | null> {
        return this.store.get(type, id, type.name)
    }

    async save(item: AggregateStoreItem) {
        return this.store.save(item)
    }

    saveTx(item: AggregateStoreItem): TransactWriteItem {
        return this.store.saveTx(item)
    }
}

const aggregate = new AggregateStore()

export default aggregate
