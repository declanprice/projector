import { DynamoStoreItem } from '../util/dynamo-store'

export type ProcessItem<Data> = {
    sk: string
    processId: string
    timestamp: string
    data: Data
} & DynamoStoreItem

export type ProcessAssociationItem = {
    associationId: string
    processId: string
} & DynamoStoreItem
