export type AggregateItem<Data extends any> = {
    id: string
    type: string
    timestamp: string
    data: Data
    version: number
}
