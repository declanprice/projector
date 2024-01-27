import { StoreItem } from '../../src/store/store.item'

export type CustomerProjection = {
    readonly customerId: string
    readonly firstName: string
    readonly lastName: string
} & StoreItem
