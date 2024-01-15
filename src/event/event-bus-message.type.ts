export type EventBusMessage<Data> = {
    type: string
    timestamp: string
    data: Data
}
