export type CommandBusMessage<Data = {}> = {
    type: string
    data: Data
    timestamp: string
}
