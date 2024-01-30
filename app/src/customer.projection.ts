import { ProjectionItem } from '../../src/store/projection/projection.item'

export type CustomerProjection = {
    customerId: string
    firstName: string
    lastName: string
} & ProjectionItem
