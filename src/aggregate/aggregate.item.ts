export type AggregateItem = {
    id: string
    type: string
    timestamp: string
    lastEvent: {
        type: string
        data: any
    }
    version: number
    [key: string]: any
}
