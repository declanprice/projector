import { AggregateItem } from '../../../src/store/aggregate/aggregate.item'

export type Customer = {
    customerId: string
    firstName: string
    lastName: string
} & AggregateItem
